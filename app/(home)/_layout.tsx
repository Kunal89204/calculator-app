import { Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { logAppOpen } from '@/firebase/analytics'


const HomeLayout = () => {
  useEffect(() => {
    logAppOpen()
  }, [])
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
