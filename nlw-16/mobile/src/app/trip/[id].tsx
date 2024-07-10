import { Button } from "@/components/Button";
import { Calendar } from "@/components/CalendarInput/Calendar";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { participantsServer } from "@/server/participants-server";
import { TripDetails, tripServer } from "@/server/trip-server";
import { tripStorage } from "@/storage/trip";
import { colors } from "@/style/colors";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarIcon,
  CalendarRange,
  Info,
  Mail,
  MapPin,
  Settings2,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { DateData } from "react-native-calendars";
import { TripActivities } from "./activities";
import { Details } from "./details";

export type TripData = TripDetails & { when: string };

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
  CONFIRM_PRESENCE = 3,
}

export default function Trip() {
  const [tripDetails, setTripDetails] = useState({} as TripData);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
  const [option, setOption] = useState<"activity" | "details">("activity");
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false);

  const { id, participant } = useLocalSearchParams<{
    id: string;
    participant?: string;
  }>();

  useEffect(() => {
    getTrip();
  }, []);

  const parseTrip = (trip: TripDetails) => {
    const maxLengthDestination = 14;

    const destination =
      trip.destination.length > maxLengthDestination
        ? trip.destination.slice(0, maxLengthDestination) + "..."
        : trip.destination;

    const isLong =
      dayjs(tripDetails.starts_at).month() !==
      dayjs(tripDetails.ends_at).month();

    const starts_at = isLong
      ? dayjs(trip.starts_at).format("DD[/]MM")
      : dayjs(trip.starts_at).format("DD");
    const ends_at = isLong
      ? dayjs(trip.ends_at).format("DD[/]MM")
      : dayjs(trip.ends_at).format("DD[ de ]MMMM");

    setDestination(trip.destination);

    setTripDetails({
      ...trip,
      when: `${destination} de ${starts_at} a ${ends_at}`,
    });
  };

  const getTrip = async () => {
    if (!id) router.back();
    try {
      const trip = await tripServer.getById(id as string);
      parseTrip(trip);
      if (participant) {
        const { is_confirmed } = await participantsServer.getById(participant);
        !is_confirmed && setShowModal(MODAL.CONFIRM_PRESENCE);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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

  const updateTrip = async () => {
    try {
      setIsUpdatingTrip(true);
      await tripServer.update({
        destination,
        ends_at: dayjs(selectedDates.endsAt?.dateString).toString(),
        starts_at: dayjs(selectedDates.startsAt?.dateString).toString(),
        id: id as string,
      });
      setShowModal(MODAL.NONE);
      getTrip();
      Alert.alert("Nova viagem", "Viagem criada com sucesso!");
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdatingTrip(false);
    }
  };

  const handleUpdateTrip = () => {
    setIsUpdatingTrip(true);
    try {
      if (!id) {
        return;
      }
      if (
        destination.trim().length === 0 ||
        !selectedDates.startsAt ||
        !selectedDates.endsAt
      ) {
        return Alert.alert(
          "Atualizar da viagem",
          "Preencha todas as informações da viagem para seguir."
        );
      }

      if (destination.trim().length < 4) {
        return Alert.alert(
          "Atualizar da viagem",
          "Destino deve ter pelo menos 4 caracteres"
        );
      }
      Alert.alert("Atualizar viagem", "Confirmar viagem?", [
        { text: "Não", style: "cancel" },
        { text: "Sim", onPress: updateTrip },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdatingTrip(false);
    }
  };

  const resetFields = () => {
    setGuestEmail("");
    setGuestName("");
    tripStorage.save(id as string);
    setShowModal(MODAL.NONE);
  };

  const handleConfirmAttendance = async () => {
    try {
      setIsConfirmingAttendance(true);
      if (!participant || !id) return;
      if (!guestEmail.trim() || !guestName.trim()) {
        return Alert.alert(
          "COnfirmação",
          "Preencha nome e e-mail para confirmar a viagem"
        );
      }

      if (!validateInput.email(guestEmail.trim())) {
        return Alert.alert("COnfirmação", "E-mail inválido!");
      }
      await participantsServer.confirmTripByParticipantId({
        participantId: participant,
        name: guestName,
        email: guestEmail.trim(),
      });
      Alert.alert("Confirmação", "Presença confirmada com sucesso!", [
        {
          text: "OK",
          onPress: resetFields,
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsConfirmingAttendance(false);
    }
  };

  const handleRemoveTrip = async () => {
    try {
      if (!id) return;
      Alert.alert("Cancelar viagem", "Deseja cancelar viagem?", [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            await tripServer.remove(id);
            tripStorage.remove();
            router.navigate("/");
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || !tripDetails.destination) return <Loading />;

  return (
    <View className='flex-1 px-5 pt-16'>
      <Input variant='tertiary' className='w-full'>
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDetails.when} readOnly className='text-sm' />
        <TouchableOpacity
          activeOpacity={0.7}
          className='w-9 h-9 bg-zinc-800 items-center justify-center rounded'
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
        >
          <Settings2 color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>
      {option === "activity" ? (
        <TripActivities {...tripDetails} />
      ) : (
        <Details tripId={id as string} />
      )}
      <View className='w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950'>
        <View className='flex-row w-full bg-zinc-900 p-4 rounded border border-zinc-800 gap-2'>
          <Button
            className='flex-1'
            variant={option === "activity" ? undefined : "secondary"}
            onPress={() => setOption("activity")}
          >
            <CalendarRange
              color={
                option === "activity" ? colors.lime[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>
          <Button
            className='flex-1'
            variant={option === "details" ? undefined : "secondary"}
            onPress={() => setOption("details")}
          >
            <Info
              color={option === "details" ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>
      <Modal
        title='Atualizar viagem'
        subtitle='Somente quem criou a viagem pode editar.'
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className='gap-2 my-4'>
          <Input>
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Para onde?'
              onChangeText={setDestination}
              value={destination}
            />
          </Input>
          <Input>
            <CalendarIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Quando?'
              onFocus={() => Keyboard.dismiss()}
              showSoftInputOnFocus={false}
              onPressIn={() => setShowModal(MODAL.CALENDAR)}
              value={selectedDates.formatDatesInText}
            />
          </Input>
          <Button isLoading={isUpdatingTrip} onPress={handleUpdateTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
          <TouchableOpacity onPress={handleRemoveTrip} activeOpacity={0.8}>
            <Text className='text-red-400 text-center m-6'>
              Cancelar viagem
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        title='Selecionar datas'
        subtitle='Selecione as datas de ida e volta da viagem'
        onClose={() => setShowModal(MODAL.UPDATE_TRIP)}
        visible={showModal === MODAL.CALENDAR}
      >
        <View className='gap-4 mt-4'>
          <Calendar
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
            minDate={dayjs().toISOString()}
          />
          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title='Confirmar presença'
        visible={MODAL.CONFIRM_PRESENCE === showModal}
      >
        <View className='gap-4 mt-4'>
          <Text className='text-zinc-400 font-regular leading-6 my-2'>
            Você foi convidado(a) para participar de uma viagem para{" "}
            <Text className='font-semibold text-zinc-100'>
              {" " + tripDetails.destination + " "}
            </Text>
            nas datas de
            <Text className='font-semibold text-zinc-100'>
              {dayjs(tripDetails.starts_at).month() !==
              dayjs(tripDetails.ends_at).month()
                ? " " +
                  dayjs(tripDetails.starts_at).format("DD[ de ]MMMM") +
                  " a " +
                  dayjs(tripDetails.ends_at).format("DD[ de ]MMMM")
                : " " +
                  dayjs(tripDetails.starts_at).format("DD") +
                  " a " +
                  dayjs(tripDetails.ends_at).format("DD[ de ]MMMM")}
              . {"\n\n"}
            </Text>
            Para confirmar sua presença na viagem, preencha os dados abaixo:
          </Text>
          <Input>
            <User color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Seu nome completo'
              onChangeText={setGuestName}
              value={guestName}
            />
          </Input>

          <Input>
            <Mail color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='E-mail de confirmação'
              onChangeText={setGuestEmail}
              value={guestEmail}
              keyboardType='email-address'
            />
          </Input>

          <Button
            isLoading={isConfirmingAttendance}
            onPress={handleConfirmAttendance}
          >
            <Button.Title>Confirmar minha presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
