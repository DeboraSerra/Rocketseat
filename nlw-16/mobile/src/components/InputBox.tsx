import { tripServer } from "@/server/trip-server";
import { tripStorage } from "@/storage/trip";
import { colors } from "@/style/colors";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import dayjs from "dayjs";
import { router } from "expo-router";
import {
  ArrowRight,
  AtSign,
  CalendarIcon,
  MapPin,
  Settings2,
  UserRoundPlus,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";
import { DateData } from "react-native-calendars";
import { Button } from "./Button";
import { Calendar } from "./CalendarInput/Calendar";
import { GuestEmail } from "./Email";
import { Input } from "./Input";
import { Modal } from "./Modal";

export enum stepForm {
  TRIP_DETAILS = 1,
  ADD_EMAILS = 2,
}

export enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export default function InputBox() {
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [step, setStep] = useState(stepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [destination, setDestination] = useState("");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [emailList, setEmailList] = useState([] as string[]);

  const handleNextStepForm = () => {
    if (
      destination.trim().length === 0 ||
      !selectedDates.startsAt ||
      !selectedDates.endsAt
    ) {
      return Alert.alert(
        "Detalhes da viagem",
        "Preencha todas as informações da viagem para seguir."
      );
    }

    if (destination.trim().length < 4) {
      return Alert.alert(
        "Detalhes da viagem",
        "Destino deve ter pelo menos 4 caracteres"
      );
    }
    if (step === stepForm.TRIP_DETAILS) {
      setStep(stepForm.ADD_EMAILS);
    }

    if (step === stepForm.ADD_EMAILS) {
      Alert.alert("Nova viagem", "Confirmar viagem?", [
        { text: "Não", style: "cancel" },
        { text: "Sim", onPress: createTrip },
      ]);
    }
  };

  const handleSelectDate = (selectedDay: DateData) => {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  };

  const handleEmailToRemove = (email: string) => {
    setEmailList((prev) => prev.filter((e) => e !== email));
  };

  const handleEmailBtnPress = () => {
    const valid = validateInput.email(emailToInvite);
    if (!valid) {
      return Alert.alert("Convidado", "Email inválido");
    }
    if (emailList.includes(emailToInvite)) {
      return Alert.alert("Convidado", "Email já adicionado");
    }
    setEmailList((prev) => [...prev, emailToInvite]);
    setEmailToInvite("");
  };

  const saveTrip = async (tripId: string) => {
    try {
      await tripStorage.save(tripId);
      router.navigate(`/trip/${tripId}`);
    } catch (error) {
      Alert.alert(
        "Salvar viagem",
        "Não foi possível salvar o id da viagem no dispositivo"
      );
      console.log(error);
    }
  };

  const createTrip = async () => {
    try {
      setIsCreatingTrip(true);
      const newTrip = await tripServer.create({
        destination,
        emails_to_invite: emailList,
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
      });

      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [
        { text: "Continuar", onPress: () => saveTrip(newTrip.tripId) },
      ]);
    } catch (error) {
      setIsCreatingTrip(false);
      console.log(error);
    }
  };

  return (
    <View className='w-full bg-zinc-900 p-4 rounded-lg my-8 border border-zinc-800 gap-3'>
      <Input>
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field
          placeholder='Para onde?'
          editable={step === stepForm.TRIP_DETAILS}
          onChangeText={setDestination}
          value={destination}
        />
      </Input>
      <Input>
        <CalendarIcon color={colors.zinc[400]} size={20} />
        <Input.Field
          placeholder='Quando?'
          editable={step === stepForm.TRIP_DETAILS}
          onFocus={() => Keyboard.dismiss()}
          showSoftInputOnFocus={false}
          onPressIn={() =>
            step === stepForm.TRIP_DETAILS && setShowModal(MODAL.CALENDAR)
          }
          value={selectedDates.formatDatesInText}
        />
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
            <Input.Field
              placeholder='Quem estará na viagem?'
              autoCorrect={false}
              value={
                emailList.length > 0
                  ? `${emailList.length} pessoa(s) convidada(s)`
                  : ""
              }
              onPress={() => {
                Keyboard.dismiss();
                setShowModal(MODAL.GUESTS);
              }}
              showSoftInputOnFocus={false}
            />
          </Input>
        </>
      )}

      <View className='py-3'>
        <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
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

      <Modal
        title='Selecionar datas'
        subtitle='Selecione as datas de ida e volta da viagem'
        onClose={() => setShowModal(MODAL.NONE)}
        visible={showModal === MODAL.CALENDAR}
      >
        <View className='gap-4 mt-4'>
          <Calendar
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
            minDate={dayjs().toISOString()}
          />
          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title='Selecionar convidados'
        subtitle='Os convidados irão receber e-mails para confirmar a participação na viagem.'
        visible={showModal === MODAL.GUESTS}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className='mt-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start'>
          {emailList.length > 0 ? (
            emailList.map((email) => (
              <GuestEmail
                email={email}
                onRemove={() => handleEmailToRemove(email)}
                key={email}
              />
            ))
          ) : (
            <Text className='text-zinc-600 text-base font-regular'>
              Nenhum email adicionado
            </Text>
          )}
        </View>
        <View className='gap-4 mt-4 mb-4'>
          <Input variant='secondary'>
            <AtSign color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Digite o e-mail do convidado'
              keyboardType='email-address'
              onChangeText={setEmailToInvite}
              value={emailToInvite}
              returnKeyType='send'
              onSubmitEditing={handleEmailBtnPress}
            />
          </Input>
        </View>
        <Button onPress={handleEmailBtnPress}>
          <Button.Title>Convidar</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
