export const auth = {
  setAuth(data) {
    if (typeof window === "undefined") return;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
  },

  getToken() {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
  },

  getUser() {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
