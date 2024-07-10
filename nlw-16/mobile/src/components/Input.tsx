import { colors } from "@/style/colors";
import clsx from "clsx";
import { Platform, TextInput, TextInputProps, View, ViewProps } from "react-native";

type Variants = "primary" | "secondary" | "tertiary";

type InputProps = ViewProps & { children?: React.ReactNode; variant?: Variants };

function Input({ children, variant = "primary", className, ...props }: InputProps) {
  return (
    <View
      className={clsx(
        "min-h-16 max-h-16 flex-row items-center gap-2 rounded-lg px-4",
        {
          "h-14 border border-zinc-800": variant === "primary",
        },
        { "bg-zinc-950": variant === "secondary" },
        { "bg-zinc-900": variant === "tertiary" },
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

function Field({ className, ...props}: TextInputProps) {
  return (
    <TextInput
      className={`flex-1 text-zinc-100 text-lg font-regular placeholder:text-zinc-400 ${className ?? ""}`}
      cursorColor={colors.zinc[100]}
      selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined} //workaround pois cursorColor não funciona no ios
      {...props}
    />
  );
}

Input.Field = Field;

export { Input };
