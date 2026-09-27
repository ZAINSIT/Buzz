const BASE_URL = "http://10.0.2.2:3000";

export const register = async (email, password, name) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name })
  });
  return res.json();
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const getProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateProfile = async (token, data) => {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getFeed = async (token) => {
  const res = await fetch(`${BASE_URL}/feed`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const swipe = async (token, swiped_id, direction) => {
  const res = await fetch(`${BASE_URL}/swipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ swiped_id, direction })
  });
  return res.json();
};

export const getMatches = async (token) => {
  const res = await fetch(`${BASE_URL}/chat/matches`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getMessages = async (token, matchId) => {
  const res = await fetch(`${BASE_URL}/chat/${matchId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
