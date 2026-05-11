import { createContext, useReducer, useCallback, useContext, useEffect } from 'react';
import { deadlineService } from '../services/deadlineService';
import { AuthContext } from './AuthContext';

export const DeadlineContext = createContext(null);

const initialState = {
  deadlines: [],
  upcomingDeadlines: [],
  isLoading: false,
  error: null,
};

function deadlineReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_DEADLINES':
      return { ...state, deadlines: action.payload, isLoading: false };
    case 'SET_UPCOMING':
      return { ...state, upcomingDeadlines: action.payload, isLoading: false };
    case 'ADD_DEADLINE':
      return { ...state, deadlines: [...state.deadlines, action.payload], isLoading: false };
    case 'UPDATE_DEADLINE': {
      const updated = action.payload;
      return {
        ...state,
        deadlines: state.deadlines.map((d) => (d.id === updated.id ? updated : d)),
        upcomingDeadlines: state.upcomingDeadlines.map((d) => (d.id === updated.id ? updated : d)).sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }),
        isLoading: false,
      };
    }
    case 'REMOVE_DEADLINE':
      return {
        ...state,
        deadlines: state.deadlines.filter((d) => d.id !== action.payload),
        upcomingDeadlines: state.upcomingDeadlines.filter((d) => d.id !== action.payload),
      };
    case 'CLEAR':
      return initialState;
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function DeadlineProvider({ children }) {
  const [state, dispatch] = useReducer(deadlineReducer, initialState);
  const { user, isLoading: authLoading } = useContext(AuthContext);

  // 로그인 시 자동 로드, 로그아웃 시 초기화
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadDeadlines();
      loadUpcoming(3);
    } else {
      dispatch({ type: 'CLEAR' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadDeadlines = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const deadlines = await deadlineService.getAll();
      dispatch({ type: 'SET_DEADLINES', payload: deadlines });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const loadUpcoming = useCallback(async (days = 3) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const upcoming = await deadlineService.getUpcoming(days);
      dispatch({ type: 'SET_UPCOMING', payload: upcoming });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const createDeadline = useCallback(async (data) => {
    try {
      const deadline = await deadlineService.create(data);
      dispatch({ type: 'ADD_DEADLINE', payload: deadline });
      // 캘린더에서 등록한 일정이 마감 임박 목록에도 반영되도록 갱신
      const upcoming = await deadlineService.getUpcoming(3);
      dispatch({ type: 'SET_UPCOMING', payload: upcoming });
      return deadline;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const toggleComplete = useCallback(async (id) => {
    try {
      const updated = await deadlineService.toggleComplete(id);
      dispatch({ type: 'UPDATE_DEADLINE', payload: updated });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const deleteDeadline = useCallback(async (id) => {
    try {
      await deadlineService.delete(id);
      dispatch({ type: 'REMOVE_DEADLINE', payload: id });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  return (
    <DeadlineContext.Provider
      value={{ ...state, loadDeadlines, loadUpcoming, createDeadline, toggleComplete, deleteDeadline }}
    >
      {children}
    </DeadlineContext.Provider>
  );
}
