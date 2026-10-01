import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- CONFIG -------------------------------------------------------------
const SHEET_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL';
const SECRET = 'change-me'; // must match SECRET in Code.gs
const CREDIT_WORDS = ['salary', 'bonus', 'refund', 'gift', 'income', 'cashback', 'received'];
const CATEGORY_WORDS = {
  Transport: ['bus', 'uber', 'bolt', 'fuel', 'petrol', 'taxi', 'keke', 'transport', 'fare'],
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'snack', 'rice', 'groceries'],
  Data: ['data', 'airtime', 'wifi', 'subscription'],
};
const DEFAULT_BUDGETS = { Transport: 20000, Food: 40000, Data: 10000, Other: 20000 };
// -------------------------------------------------------------------------

const detectType = (name, rawPrice) =>
  rawPrice.trim().startsWith('+') ||
  CREDIT_WORDS.some((w) => name.toLowerCase().includes(w))
    ? 'credit'
    : 'debit';

const detectCategory = (name) => {
  const n = name.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_WORDS))
    if (words.some((w) => n.includes(w))) return cat;
  return 'Other';
};

const monthKey = (d) => d.slice(0, 7); // YYYY-MM
const fmt = (n) => Number(n).toLocaleString();

export default function App() {
  const [tab, setTab] = useState('log');
  const [entries, setEntries] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    (async () => {
      const e = JSON.parse((await AsyncStorage.getItem('entries')) || '[]');
      const b = JSON.parse((await AsyncStorage.getItem('budgets')) || 'null');
      setEntries(e);
      if (b) setBudgets(b);
      retryUnsynced(e);
    })();
  }, []);

  const persist = async (e) => {
    setEntries(e);
    await AsyncStorage.setItem('entries', JSON.stringify(e));
  };

  const sync = async (entry) => {
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight on Apps Script
        body: JSON.stringify({ ...entry, secret: SECRET }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const retryUnsynced = async (list) => {
    const updated = [...list];
    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].synced && (await sync(updated[i]))) updated[i].synced = true;
    }
    persist(updated);
  };

  const checkBudget = (list, category) => {
    const month = monthKey(new Date().toISOString());
    const spent = list
      .filter((e) => e.type === 'debit' && e.category === category && monthKey(e.date) === month)
      .reduce((s, e) => s + e.amount, 0);
    const limit = budgets[category];
    if (!limit) return;
    if (spent > limit)
      Alert.alert('Over budget', `${category}: ${fmt(spent)} spent, limit is ${fmt(limit)}.`);
    else if (spent >= limit * 0.8)
      Alert.alert('Heads up', `${category} is at ${Math.round((spent / limit) * 100)}% of budget.`);
  };

  const addEntry = async () => {
    const amount = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!name.trim() || !amount) return Alert.alert('Enter a name and a price');
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: name.trim(),
      amount,
      type: detectType(name, price),
      category: detectCategory(name),
      synced: false,
    };
    entry.synced = await sync(entry);
    const list = [entry, ...entries];
    await persist(list);
    setName('');
    setPrice('');
    if (entry.type === 'debit') checkBudget(list, entry.category);
  };

  const toggleType = (id) =>
    persist(entries.map((e) => (e.id === id ? { ...e, type: e.type === 'debit' ? 'credit' : 'debit' } : e)));

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={s.tabs}>
          {['log', 'budget', 'calc'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabOn]}>
              <Text style={tab === t ? s.tabTextOn : s.tabText}>
                {t === 'log' ? 'Log' : t === 'budget' ? 'Budget' : 'Calculator'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'log' && (
          <View style={{ flex: 1 }}>
            <TextInput style={s.input} placeholder="Expense (e.g. Food)" value={name} onChangeText={setName} />
            <TextInput
              style={s.input}
              placeholder="Price (prefix + for income)"
              keyboardType="numbers-and-punctuation"
              value={price}
              onChangeText={setPrice}
            />
            <TouchableOpacity style={s.btn} onPress={addEntry}>
              <Text style={s.btnText}>Add</Text>
            </TouchableOpacity>
            <FlatList
              data={entries}
              keyExtractor={(e) => e.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleType(item.id)} style={s.row}>
                  <View>
                    <Text style={s.rowName}>{item.name}</Text>
                    <Text style={s.rowSub}>
                      {item.category} · {item.date.slice(0, 10)} {item.synced ? '' : '· not synced'}
                    </Text>
                  </View>
                  <Text style={{ color: item.type === 'credit' ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                    {item.type === 'credit' ? '+' : '-'}{fmt(item.amount)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Text style={s.hint}>Tap an entry to flip credit/debit if it guessed wrong.</Text>
          </View>
        )}

        {tab === 'budget' && (
          <BudgetTab entries={entries} budgets={budgets} setBudgets={(b) => {
            setBudgets(b);
            AsyncStorage.setItem('budgets', JSON.stringify(b));
          }} />
        )}

        {tab === 'calc' && <Calculator />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BudgetTab({ entries, budgets, setBudgets }) {
  const month = monthKey(new Date().toISOString());
  return (
    <View>
      {Object.keys(budgets).map((cat) => {
        const spent = entries
          .filter((e) => e.type === 'debit' && e.category === cat && monthKey(e.date) === month)
          .reduce((s, e) => s + e.amount, 0);
        const pct = Math.min(spent / budgets[cat], 1);
        return (
          <View key={cat} style={s.budgetRow}>
            <Text style={s.rowName}>{cat}: {fmt(spent)} / </Text>
            <TextInput
              style={s.limitInput}
              keyboardType="numeric"
              value={String(budgets[cat])}
              onChangeText={(v) => setBudgets({ ...budgets, [cat]: Number(v) || 0 })}
            />
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${pct * 100}%`, backgroundColor: pct >= 1 ? '#dc2626' : '#2563eb' }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Calculator() {
  const [expr, setExpr] = useState('');
  const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','+','(',')','⌫','='];
  const press = (k) => {
    if (k === 'C') return setExpr('');
    if (k === '⌫') return setExpr(expr.slice(0, -1));
    if (k === '=') {
      try {
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return;
        setExpr(String(Function(`"use strict";return (${expr})`)()));
      } catch { setExpr('Error'); }
      return;
    }
    setExpr(expr === 'Error' ? k : expr + k);
  };
  return (
    <View style={{ padding: 16 }}>
      <Text style={s.calcDisplay}>{expr || '0'}</Text>
      <View style={s.keys}>
        {keys.map((k) => (
          <TouchableOpacity key={k} style={s.key} onPress={() => press(k)}>
            <Text style={s.keyText}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  tabs: { flexDirection: 'row', margin: 12, backgroundColor: '#f1f5f9', borderRadius: 10 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: '#2563eb' },
  tabText: { color: '#334155' },
  tabTextOn: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginHorizontal: 12, marginBottom: 8 },
  btn: { backgroundColor: '#2563eb', margin: 12, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  rowName: { fontSize: 16 },
  rowSub: { color: '#64748b', fontSize: 12 },
  hint: { textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: 8 },
  budgetRow: { padding: 12, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' },
  limitInput: { borderBottomWidth: 1, minWidth: 80, fontSize: 16 },
  barBg: { width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, marginTop: 6 },
  barFill: { height: 8, borderRadius: 4 },
  calcDisplay: { fontSize: 36, textAlign: 'right', padding: 16 },
  keys: { flexDirection: 'row', flexWrap: 'wrap' },
  key: { width: '25%', padding: 20, alignItems: 'center' },
  keyText: { fontSize: 22 },
});