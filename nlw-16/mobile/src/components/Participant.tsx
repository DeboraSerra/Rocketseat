import { CircleCheck, CircleDashed } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors } from "@/style/colors";

export type ParticipantProps = {
  id: string;
  name?: string;
  email: string;
  is_confirmed: boolean;
};

export function Participant({
  email,
  id,
  is_confirmed,
  name,
}: ParticipantProps) {
  return (
    <View className='w-full flex-row items-center'>
      <View className='flex-1'>
        <Text className='text-zinc-100 text-base font-semibold'>
          {name ?? "Pendente"}
        </Text>

        <Text className='text-zinc-400 text-sm'>{email}</Text>
      </View>

      {is_confirmed ? (
        <CircleCheck color={colors.lime[300]} size={20} />
      ) : (
        <CircleDashed color={colors.zinc[400]} size={20} />
      )}
    </View>
  );
}
