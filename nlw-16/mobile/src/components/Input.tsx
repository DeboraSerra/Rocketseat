import { colors } from "@/style/colors";
import clsx from "clsx";
import { Platform, TextInput, TextInputProps, View } from "react-native";

type Variants = "primary" | "secondary" | "tertiary";

type InputProps = { children?: React.ReactNode; variant?: Variants };

function Input({ children, variant = "primary" }: InputProps) {
  return (
    <View
      className={clsx(
        "w-full h-16 flex-row items-center gap-2 rounded-lg px-4",
        {
          "h-14 border border-zinc-800": variant === "primary",
        },
        { "bg-zinc-950": variant === "secondary" },
        { "bg-zinc-900": variant === "tertiary" }
      )}
    >
      {children}
    </View>
  );
}

function Field(props: TextInputProps) {
  return (
    <TextInput
      className='flex-1 text-zinc-100 text-lg font-regular placeholder:text-zinc-400'
      cursorColor={colors.zinc[100]}
      selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined} //workaround pois cursorColor não funciona no ios
      {...props}
    />
  );
}

Input.Field = Field;

export { Input };
