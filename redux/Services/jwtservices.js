import AsyncStorage from "@react-native-async-storage/async-storage";

const jwtService = {
  getToken: () => {
    return AsyncStorage.getItem('jwtToken');
  },
  saveToken: (token) => {
    AsyncStorage.setItem('jwtToken', token);
  },
  destroyToken: () => {
    AsyncStorage.removeItem('jwtToken');
  },
};

export default jwtService;