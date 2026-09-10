import {
	Platform,
	KeyboardAvoidingView,
	StyleSheet,
	ScrollView,
	View,
  } from 'react-native';
  import React from 'react';
import { Colors } from '../../Constants/Colors';

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 20 : 0;
  const behavior = Platform.OS === 'ios' ? 'padding' : undefined;
  const FormContainer = ({
	children,
	backgroundColor = Colors.white,
	style = {},
	nestedScrollEnabled = true
  }) => {
	// print('FormContainer');
	return (
	  <KeyboardAvoidingView
		style={[
		
		  style,
		  styles.keyboard,
		]}
		behavior={behavior}
		keyboardVerticalOffset={keyboardVerticalOffset}>
		<ScrollView 
		nestedScrollEnabled={nestedScrollEnabled}
		showsVerticalScrollIndicator={false}>{children}</ScrollView>
	  </KeyboardAvoidingView>
	);
  };
  
  export default FormContainer;
  const styles = StyleSheet.create({
	keyboard: {},
  });
  