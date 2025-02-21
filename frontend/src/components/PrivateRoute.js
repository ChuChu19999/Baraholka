import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../store/slices/profileSlice';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  console.log('PrivateRoute проверка');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('Текущий путь:', location.pathname);
  console.log('Предыдущий путь:', location.state?.from);

  useEffect(() => {
    if (isAuthenticated && !user) {
      console.log('PrivateRoute: Загрузка профиля пользователя');
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
