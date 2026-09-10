import SimpleToast from 'react-native-simple-toast';
export const ToastMsg = (message, time = 100) => {
  let timeout = setTimeout(() => {
    SimpleToast.show(message);
    clearTimeout(timeout);
  }, 300);
};