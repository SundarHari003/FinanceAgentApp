import { useLayoutEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

export const useHideTabBar = (hideOnScreens = []) => {
  const navigation = useNavigation();
  const route = useRoute();

  const shouldHide = hideOnScreens.includes(route.name);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: shouldHide ? { display: 'none' } : undefined,
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [shouldHide, route.name]);
};
