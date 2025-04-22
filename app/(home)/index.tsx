import React, { useEffect, useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, StatusBar } from "react-native";



export default function Index() {

  const router = useRouter();
  const [display, setDisplay] = useState('0');
  const [firstValue, setFirstValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);

  

  const handleNumberPress = (number: string) => {
    setDisplay(prevDisplay =>
      prevDisplay === '0' ? number : prevDisplay + number
    );
  };

  const handleOperatorPress = (op: string) => {
    setFirstValue(display);
    setOperator(op);
    setDisplay('0');
  };

  const calculateResult = () => {
    if (!firstValue || !operator) return;

    const num1 = parseFloat(firstValue);
    const num2 = parseFloat(display);
    let result;

    switch (operator) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        result = num1 - num2;
        break;
      case '*':
        result = num1 * num2;
        break;
      case '/':
        result = num1 / num2;
        break;
    }

    const resultString = result?.toString() || '0';

    // Special condition for the specific calculation
    if (num1 === 122005 && num2 === 892004 && operator === '+') {
      console.log('Routing to settings');
      router.push('/chat');
      return;
    }

    setDisplay(resultString);
    setFirstValue(null);
    setOperator(null);
  };

  const clearDisplay = () => {
    setDisplay('0');
    setFirstValue(null);
    setOperator(null);
  };



  const buttonStyle = "bg-gray-700 rounded-full w-20 h-20 justify-center items-center m-2";
  const buttonTextStyle = "text-white text-2xl";
  const operatorButtonStyle = "bg-orange-600 rounded-full w-20 h-20 justify-center items-center m-2";

  return (
    <View className="flex-1 bg-black justify-end items-center pb-10">
     
      <View className="bg-gray-900 w-full p-5 items-end">
        <Text className="text-4xl text-white">{display}</Text>
      </View>

      <View className="flex-row">
        <TouchableOpacity onPress={() => handleNumberPress('7')} className={buttonStyle}>
          <Text className={buttonTextStyle}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('8')} className={buttonStyle}>
          <Text className={buttonTextStyle}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('9')} className={buttonStyle}>
          <Text className={buttonTextStyle}>9</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOperatorPress('/')} className={operatorButtonStyle}>
          <Text className="text-white text-2xl">÷</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <TouchableOpacity onPress={() => handleNumberPress('4')} className={buttonStyle}>
          <Text className={buttonTextStyle}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('5')} className={buttonStyle}>
          <Text className={buttonTextStyle}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('6')} className={buttonStyle}>
          <Text className={buttonTextStyle}>6</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOperatorPress('*')} className={operatorButtonStyle}>
          <Text className="text-white text-2xl">×</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <TouchableOpacity onPress={() => handleNumberPress('1')} className={buttonStyle}>
          <Text className={buttonTextStyle}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('2')} className={buttonStyle}>
          <Text className={buttonTextStyle}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('3')} className={buttonStyle}>
          <Text className={buttonTextStyle}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOperatorPress('-')} className={operatorButtonStyle}>
          <Text className="text-white text-2xl">-</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <TouchableOpacity onPress={clearDisplay} className={buttonStyle}>
          <Text className={buttonTextStyle}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNumberPress('0')} className={buttonStyle}>
          <Text className={buttonTextStyle}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={calculateResult} className={buttonStyle}>
          <Text className={buttonTextStyle}>=</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOperatorPress('+')} className={operatorButtonStyle}>
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}