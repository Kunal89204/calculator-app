import { Stack } from 'expo-router'
import React from 'react'
import { StatusBar } from 'react-native'

const HomeLayout = () => {
  return (
    <>
     <StatusBar backgroundColor={'black'} />
    <Stack screenOptions={{
      headerShown:false
    }} >
      <Stack.Screen name='index' />
    </Stack>
      </>
  )
}

export default HomeLayout
