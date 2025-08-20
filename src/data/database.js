// Banco de dados em memória
let members = [];
let music = [];
let scales = [];
let nextMemberId = 1;
let nextMusicId = 1;
let nextScaleId = 1;

// Funções para gerenciar membros
const getMembers = () => members;
const getMemberById = (id) => members.find(member => member.id === id);
const addMember = (member) => {
  const newMember = { ...member, id: nextMemberId++ };
  members.push(newMember);
  return newMember;
};
const updateMember = (id, updates) => {
  const index = members.findIndex(member => member.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    return members[index];
  }
  return null;
};
const deleteMember = (id) => {
  const index = members.findIndex(member => member.id === id);
  if (index !== -1) {
    members.splice(index, 1);
    return true;
  }
  return false;
};

// Funções para gerenciar músicas
const getMusic = () => music;
const getMusicById = (id) => music.find(song => song.id === id);
const addMusic = (song) => {
  const newSong = { ...song, id: nextMusicId++ };
  music.push(newSong);
  return newSong;
};
const updateMusic = (id, updates) => {
  const index = music.findIndex(song => song.id === id);
  if (index !== -1) {
    music[index] = { ...music[index], ...updates };
    return music[index];
  }
  return null;
};
const deleteMusic = (id) => {
  const index = music.findIndex(song => song.id === id);
  if (index !== -1) {
    music.splice(index, 1);
    return true;
  }
  return false;
};

// Funções para gerenciar escalas
const getScales = () => scales;
const getScaleById = (id) => scales.find(scale => scale.id === id);
const addScale = (scale) => {
  const newScale = { ...scale, id: nextScaleId++ };
  scales.push(newScale);
  return newScale;
};
const updateScale = (id, updates) => {
  const index = scales.findIndex(scale => scale.id === id);
  if (index !== -1) {
    scales[index] = { ...scales[index], ...updates };
    return scales[index];
  }
  return null;
};
const deleteScale = (id) => {
  const index = scales.findIndex(scale => scale.id === id);
  if (index !== -1) {
    scales.splice(index, 1);
    return true;
  }
  return false;
};

// Função para resetar o banco de dados (útil para testes)
const resetDatabase = () => {
  members = [];
  music = [];
  scales = [];
  nextMemberId = 1;
  nextMusicId = 1;
  nextScaleId = 1;
};

module.exports = {
  // Membros
  getMembers,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
  
  // Músicas
  getMusic,
  getMusicById,
  addMusic,
  updateMusic,
  deleteMusic,
  
  // Escalas
  getScales,
  getScaleById,
  addScale,
  updateScale,
  deleteScale,
  
  // Utilitários
  resetDatabase
};
