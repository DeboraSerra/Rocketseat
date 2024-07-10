import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Participant, ParticipantProps } from "@/components/Participant";
import { TripLink, TripLinkProps } from "@/components/TripLink";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participants-server";
import { colors } from "@/style/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

type Props = {
  tripId: string;
};

export const Details = ({ tripId }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [links, setLinks] = useState([] as TripLinkProps[]);
  const [participants, setParticipants] = useState([] as ParticipantProps[]);

  const [isCreatingLink, setIsCreatingLink] = useState(false);

  useEffect(() => {
    getLinks();
    getParticipants();
  }, []);

  const getLinks = async () => {
    const fetched = await linksServer.getLinksByTripId(tripId);
    setLinks(fetched);
  };

  const resetFields = () => {
    setShowModal(false);
    setLinkName("");
    setLinkUrl("");
    getLinks();
  };

  const handleSalvarLink = async () => {
    try {
      setIsCreatingLink(true);
      const validUrl = validateInput.url(linkUrl.trim());
      if (!validUrl) {
        return Alert.alert("Link", "Link inválido!");
      }
      if (!linkName.trim()) {
        return Alert.alert("Link", "Informe o título do link!");
      }
      await linksServer.create({
        tripId,
        title: linkName,
        url: linkUrl,
      });
      Alert.alert("Link", "Link adicionado com sucesso!", [
        {
          text: "OK",
          onPress: resetFields,
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const getParticipants = async () => {
    try {
      const fetched = await participantsServer.getByTripId(tripId);
      setParticipants(fetched.sort((p) => (p.is_confirmed ? -1 : 1)));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className='flex-1 mt-10'>
      <Text className='text-zinc-50 text-2xl font-semibold mb-2'>
        Links importantes
      </Text>
      <View className='flex-1'>
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink {...item} />}
            contentContainerClassName='gap-4'
          />
        ) : (
          <Text className='text-zinc-400 font-regular text-base mt-2 mb-6'>
            Nenhum link adicionado.
          </Text>
        )}
        <Button
          variant='secondary'
          className='mb-4'
          onPress={() => setShowModal(true)}
        >
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className='flex-1 border-t border-zinc-800 mt6'>
        <Text className='text-zinc-50 text-2xl font-semibold my-6'>
          Convidados
        </Text>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant {...item} />}
          contentContainerClassName='gap-4'
        />
      </View>

      <Modal
        title='Cadastrar link'
        subtitle='Todos os convidados podem visualizar os links importantes'
        onClose={() => setShowModal(false)}
        visible={showModal}
      >
        <View className='gap-2 mb-3'>
          <Input variant='secondary'>
            <Input.Field
              placeholder='Título do link'
              onChangeText={setLinkName}
              value={linkName}
            />
          </Input>
          <Input variant='secondary'>
            <Input.Field
              placeholder='URL'
              onChangeText={setLinkUrl}
              value={linkUrl}
            />
          </Input>
          <Button onPress={handleSalvarLink} isLoading={isCreatingLink}>
            <Button.Title>Salvar link</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
};
