/* engine.js — 데이터 저장·불러오기 엔진 (v2.0) */
'use strict';

const STORAGE_KEY = 'careStudy_v2';

function getTodayString() {
  return new Date().toISOString().split('T')[0]; // 실제 날짜 사용
}

function initData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const d = {
    profile: { name: '나윤이', grade: 4, startDate: getTodayString() },
    attendance: {},
    attention: { currentLevel: 2, streak: 0, lastDate: null },
    growth: { totalDays: 0, leafCount: 0, treeStage: 0 }
  };
  saveData(d); return d;
}

function getData() { return initData(); }

function saveData(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function isBlockADoneToday() {
  const d = getData(), today = getTodayString();
  return !!(d.attendance[today]?.blockA);
}

function markBlockAComplete() {
  const d = getData(), today = getTodayString();
  if (!d.attendance[today]) d.attendance[today] = { blockA: false, blockB: {} };
  d.attendance[today].blockA = true;

  // 연속 학습일 계산
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yd = yesterday.toISOString().split('T')[0];
  if (d.attention.lastDate === yd) {
    d.attention.streak = (d.attention.streak || 0) + 1;
  } else if (d.attention.lastDate !== today) {
    d.attention.streak = 1;
  }
  d.attention.lastDate = today;
  d.growth.totalDays = (d.growth.totalDays || 0) + 1;

  saveData(d);
}

function markBlockBComplete(subject) {
  const d = getData(), today = getTodayString();
  if (!d.attendance[today]) d.attendance[today] = { blockA: true, blockB: {} };
  if (!d.attendance[today].blockB) d.attendance[today].blockB = {};
  d.attendance[today].blockB[subject] = true;

  d.growth.leafCount = (d.growth.leafCount || 0) + 1;
  if (d.growth.leafCount >= 30) d.growth.treeStage = 3;
  else if (d.growth.leafCount >= 10) d.growth.treeStage = 2;
  else if (d.growth.leafCount >= 3)  d.growth.treeStage = 1;

  saveData(d);
}

function getAttendanceForMonth(year, month) {
  const d = getData();
  const result = {};
  Object.keys(d.attendance).forEach(date => {
    const [y, m] = date.split('-').map(Number);
    if (y === year && m === month) result[date] = d.attendance[date];
  });
  return result;
}

window.addEventListener('DOMContentLoaded', () => initData());
