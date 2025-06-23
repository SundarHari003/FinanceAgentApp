import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme, selectTheme } from '../redux/features/themeSlice';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';

export const useThemeMode = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectTheme);
  const deviceTheme = useColorScheme();

  useEffect(() => {
    // Sync with system theme on mount
    dispatch(setTheme(deviceTheme === 'dark'));
  }, [deviceTheme]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return {
    isDarkMode,
    toggleTheme: handleToggleTheme,
  };
};