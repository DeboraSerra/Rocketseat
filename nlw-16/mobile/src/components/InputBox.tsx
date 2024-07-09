import { colors } from "@/style/colors";
import {
  ArrowRight,
  CalendarIcon,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";

enum stepForm {
  TRIP_DETAILS = 1,
  ADD_EMAILS = 2,
}

export default function InputBox() {
  const [step, setStep] = useState(stepForm.TRIP_DETAILS);
  const handleNextStepForm = () => {
    if (step === stepForm.TRIP_DETAILS) {
      setStep(stepForm.ADD_EMAILS);
    }
  };

  return (
    <View className='w-full bg-zinc-900 p-4 rounded-lg my-8 border border-zinc-800 gap-3'>
      <Input>
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field placeholder='Para onde?' editable={step === stepForm.TRIP_DETAILS} />
      </Input>
      <Input>
        <CalendarIcon color={colors.zinc[400]} size={20} />
        <Input.Field placeholder='Quando?' editable={step === stepForm.TRIP_DETAILS} />
      </Input>
      {step === stepForm.ADD_EMAILS && (
        <>
          <View className='border-b py-3 border-zinc-800'>
            <Button
              variant='secondary'
              onPress={() => setStep(stepForm.TRIP_DETAILS)}
            >
              <Button.Title>Alterar local/data</Button.Title>
              <Settings2 color={colors.zinc[200]} />
            </Button>
          </View>

          <Input>
            <UserRoundPlus color={colors.zinc[400]} size={20} />
            <Input.Field placeholder='Quem estará na viagem?' />
          </Input>
        </>
      )}

      <View className='py-3'>
        <Button onPress={handleNextStepForm}>
          <Button.Title>
            {step === stepForm.ADD_EMAILS ? "Confirmar viagem" : "Continuar"}
          </Button.Title>
          <ArrowRight color={colors.zinc[950]} />
        </Button>
      </View>

      <Text className='text-zinc-500 font-regular text-center text-xs'>
        Ao planejar sua viagem pela plann.er você automaticamente concorda com
        nossos <Text className='text-zinc-300 underline'>termos de uso</Text> e{" "}
        <Text className='text-zinc-300 underline'>
          políticas de privacidade
        </Text>
        .
      </Text>
    </View>
  );
}
