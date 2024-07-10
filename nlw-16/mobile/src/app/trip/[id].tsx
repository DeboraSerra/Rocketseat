import { Button } from "@/components/Button";
import { Calendar } from "@/components/CalendarInput/Calendar";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { TripDetails, tripServer } from "@/server/trip-server";
import { colors } from "@/style/colors";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarIcon,
  CalendarRange,
  Info,
  MapPin,
  Settings2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, TouchableOpacity, View } from "react-native";
import { DateData } from "react-native-calendars";
import { TripActivities } from "./activities";
import { Details } from "./details";

export type TripData = TripDetails & { when: string };

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CALENDAR = 2,
}

export default function Trip() {
  const [tripDetails, setTripDetails] = useState({} as TripData);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTrip, setIsUpdatingTrip] = useState(false);
  const [option, setOption] = useState<"activity" | "details">("activity");
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    getTrip();
  }, []);

  const parseTrip = (trip: TripDetails) => {
    const maxLengthDestination = 14;

    const destination =
      trip.destination.length > maxLengthDestination
        ? trip.destination.slice(0, maxLengthDestination) + "..."
        : trip.destination;

    const starts_at = dayjs(trip.starts_at).format("DD");
    const ends_at = dayjs(trip.ends_at).format("DD");
    const month = dayjs(trip.ends_at).format("MMM");

    setDestination(trip.destination);

    setTripDetails({
      ...trip,
      when: `${destination} de ${starts_at} a ${ends_at} de ${month}`,
    });
  };

  const getTrip = async () => {
    if (!id) router.back();
    try {
      const trip = await tripServer.getById(id as string);
      parseTrip(trip);
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
      Alert.alert("Nova viagem", "Viagem criada com sucesso!", [{
        text: "OK", onPress: getTrip
      }]);
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

  if (isLoading || !tripDetails.destination) return <Loading />;

  return (
    <View className='flex-1 px-5 pt-16'>
      <Input variant='tertiary'>
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
    </View>
  );
}
