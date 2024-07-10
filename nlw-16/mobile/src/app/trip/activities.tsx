import { Activity, ActivityProps } from "@/components/Activity";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/CalendarInput/Calendar";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { activitiesServer } from "@/server/activities-server";
import { colors } from "@/style/colors";
import dayjs from "dayjs";
import { CalendarIcon, Clock, PlusIcon, Tag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, SectionList, Text, View } from "react-native";
import { TripData } from "./[id]";

enum MODAL {
  NONE = 0,
  CALENDAR = 1,
  NEW_ACTIVITY = 2,
}

type TripActivity = {
  title: {
    dayNumber: number;
    dayName: string;
  };
  data: ActivityProps[];
};

export const TripActivities = ({
  destination,
  ends_at,
  id,
  is_confirmed,
  starts_at,
  when,
}: TripData) => {
  const [activities, setActivities] = useState([] as TripActivity[]);
  const [showModal, setShowModal] = useState(MODAL.NONE);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityHour, setActivityHour] = useState("");
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  useEffect(() => {
    getActivities();
  }, []);

  const resetActivity = () => {
    setActivityDate("");
    setActivityHour("");
    setActivityTitle("");
    getActivities();
  };

  const handleCreateActivity = async () => {
    try {
      setIsActivityLoading(true);
      if (!activityTitle || !activityHour || !activityDate) {
        return Alert.alert("Cadastrar atividade", "Preencha todos os campos");
      }
      await activitiesServer.create({
        tripId: id,
        occurs_at: dayjs(activityDate)
          .add(Number(activityHour), "h")
          .toString(),
        title: activityTitle,
      });

      Alert.alert(
        "Cadastrar atividade",
        "Nova atividade cadastrada com sucesso",
        [
          {
            text: "OK",
            onPress: resetActivity,
          },
        ]
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsActivityLoading(false);
    }
  };

  const getActivities = async () => {
    const fetched = await activitiesServer.getActivitiesByTripId(id);
    const activitiesToSectionList = fetched.map((activity) => ({
      title: {
        dayNumber: dayjs(activity.date).date(),
        dayName: dayjs(activity.date).format("dddd").replace("-feira", ""),
      },
      data: activity.activities.map((a) => ({
        id: a.id,
        title: a.title,
        hour: dayjs(a.occurs_at).format("hh[:]mm[h]"),
        isBefore: dayjs(a.occurs_at).isBefore(dayjs()),
      })),
    }));
    setActivities(activitiesToSectionList);
  };

  return (
    <View className='flex-1'>
      <View className='w-full flex-row mt-5 mb-6 items-center'>
        <Text className='text-zinc-50 text-2xl font-semibold flex-1'>
          Atividades
        </Text>
        <Button
          className='px-2'
          onPress={() => setShowModal(MODAL.NEW_ACTIVITY)}
        >
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>
      {isActivityLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Activity {...item} />}
          renderSectionHeader={({ section }) => (
            <View className='w-full'>
              <Text className='text-zinc-50 text-2xl font-semibold py-2'>
                Dia {section.title.dayNumber + " "}
                <Text className='text-zinc-500 text-base font-regular capitalize'>
                  {section.title.dayName}
                </Text>
              </Text>
              {section.data.length === 0 && (
                <Text className='text-zinc-500 text-sm mb-500 mb-8'>
                  Nenhuma atividade cadastrada nessa data
                </Text>
              )}
            </View>
          )}
          contentContainerClassName='gap-3 pb-48'
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        title='Cadastrar atividade'
        subtitle='Todos os convidados podem visualizar as atividades'
        visible={showModal === MODAL.NEW_ACTIVITY}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className='mt-4 mb-3'>
          <Input variant='secondary'>
            <Tag color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder='Qual atividade?'
              onChangeText={setActivityTitle}
              value={activityTitle}
            />
          </Input>
          <View className='w-full mt-2 flex-row gap-2'>
            <Input variant='secondary' className='flex-1'>
              <CalendarIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder='Data?'
                onFocus={() => Keyboard.dismiss()}
                showSoftInputOnFocus={false}
                onPressIn={() => setShowModal(MODAL.CALENDAR)}
                value={
                  activityDate ? dayjs(activityDate).format("DD[ de ]MMM") : ""
                }
              />
            </Input>
            <Input variant='secondary' className='flex-1'>
              <Clock color={colors.zinc[400]} size={20} />
              <Input.Field
                placeholder='Horário?'
                onChangeText={(text) =>
                  setActivityHour(text.replace(/[.,]/g, ""))
                }
                value={activityHour}
                keyboardType='numeric'
                maxLength={2}
              />
            </Input>
          </View>
          <Button
            onPress={() => {
              setShowModal(MODAL.NONE);
              handleCreateActivity();
            }}
            isLoading={isActivityLoading}
            className='mt-4'
          >
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title='Selecionar datas'
        subtitle='Selecione a data da atividade'
        onClose={() => setShowModal(MODAL.NONE)}
        visible={showModal === MODAL.CALENDAR}
      >
        <View className='gap-4 mt-4'>
          <Calendar
            onDayPress={(date) => {
              setActivityDate(date.dateString);
              setShowModal(MODAL.NEW_ACTIVITY);
            }}
            markedDates={{ [activityDate]: { selected: true } }}
            initialDate={starts_at.toString()}
            minDate={dayjs(starts_at).toISOString()}
            maxDate={dayjs(ends_at).toISOString()}
          />
        </View>
      </Modal>
    </View>
  );
};
