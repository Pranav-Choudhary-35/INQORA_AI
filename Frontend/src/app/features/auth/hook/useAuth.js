import { useDispatch } from "react-redux";
import { register, login, logout, getCurrentUser } from "../services/api.auth";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));

      const res = await register({ email, username, password });

      dispatch(setUser(res.user));

      return res;
    } catch (error) {
      const message = error.message || "Registration failed";

      dispatch(setError(message));

      throw new Error(message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
  try {
    dispatch(setLoading(true));

    const res = await login({ email, password });

    dispatch(setUser(res.user));

    return res;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Invalid email or password";

    dispatch(setError(message));

    throw new Error(message); // 🔥 THIS WAS MISSING
  } finally {
    dispatch(setLoading(false));
  }
}

  async function fetchCurrentUser() {
    try {
      dispatch(setLoading(true));
      const res = await getCurrentUser();
      dispatch(setUser(res.user));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch user"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout(navigate) {
    try {
      await logout();
      dispatch(setUser(null));
      navigate?.("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return { handleRegister, handleLogin, handleLogout, fetchCurrentUser };
}
