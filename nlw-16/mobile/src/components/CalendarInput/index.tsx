import { colors } from "@/style/colors";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import dayjs from "dayjs";
import { CalendarIcon, View } from "lucide-react-native";
import { useState } from "react";
import { Keyboard } from "react-native";
import { DateData } from "react-native-calendars";
import { Button } from "../Button";
import { Input } from "../Input";
import { MODAL, stepForm } from "../InputBox";
import { Modal } from "../Modal";
import { Calendar } from "./Calendar";

type CalendarInputProps = {
  step: number;
  showModal: number;
  setShowModal: (val: number) => void;
};

const CalendarInput = ({
  step,
  showModal,
  setShowModal,
}: CalendarInputProps) => {
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  const handleSelectDate = (selectedDay: DateData) => {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  };

  return (
    <>
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
        />
      </Input>
      <Modal
        title='Selecionar datas'
        subtitle='Selecione as datas de ida e volta da viagem'
        onClose={() => setShowModal(MODAL.NONE)}
        visible={showModal === MODAL.CALENDAR}
      >
        <View className='gap-4 mt-4'>
          <Calendar /><Calendar
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
            minDate={dayjs().toISOString()}
          />
          <Button onPress={() => setShowModal(MODAL.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </>
  );
};

export default CalendarInput;
