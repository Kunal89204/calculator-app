import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

const TypingIndicator = ({ isTyping }: { isTyping: boolean }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: isTyping ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isTyping]);
  
    return (
      <Animated.View style={{ opacity: fadeAnim, marginBottom:2 }}>
        <Text className="text-white">
          {isTyping ? "typing..." : ""}
        </Text>
      </Animated.View>
    );
  };

  export default TypingIndicator
  