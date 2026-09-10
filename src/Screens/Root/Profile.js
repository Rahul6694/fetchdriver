import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Press from '../../Component/UI/Press'
import { Typography } from '../../Component/Typography'
import { useDispatch } from "react-redux";
import { isAuth } from '../../Redux/action';

const Profile = () => {
  const Dispatch = useDispatch();
  return (
    <View>
      <Text>Profile</Text>
      <Press onPress={()=>
          Dispatch(isAuth(false))

      }><Typography>LogOUT</Typography>
        </Press>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})