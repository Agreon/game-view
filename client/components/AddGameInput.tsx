import { Input } from "@chakra-ui/input";
import { Button, useColorModeValue, useDisclosure, } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/layout";
import React, { useState, useCallback, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import { GameProvider } from "../providers/GameProvider";
import { useGamesContext } from "../providers/GamesProvider";
import { useAction } from "../util/useAction";
import { AddGameModal } from "./AddGameModal";

/**
// width={["100%", "100%", "80%", "60%", "50%", "35%"]}
 */
export const AddGameInput: React.FC = () => {
    const { addGame, setGame, removeGame, games } = useGamesContext();
    const [name, setName] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [gameId, setGameId] = useState<string | null>(null);
    const { loading, execute: searchGame } = useAction(addGame, {
        onSuccess: game => {
            setGameId(game.id);
            onOpen();
        }
    })

    // Focus initially
    const inputRef = useRef<HTMLInputElement | null>(null)
    useEffect(() => { inputRef.current && inputRef.current.focus() }, []);

    const onNameKeyPress = useCallback(async ({ key }: KeyboardEvent<HTMLInputElement>) => {
        if (key === "Enter") {
            await searchGame(name);
        }
    }, [searchGame, name]);

    const onCloseModal = useCallback(() => {
        setGameId(null)
        setName("");
        onClose();
    }, [onClose])

    const currentGame = useMemo(() => games.find(game => game.id === gameId), [games, gameId]);

    return (
        <>
            <Flex align="center">
                <Input
                    ref={inputRef}
                    value={name}
                    disabled={loading}
                    onChange={(event) => setName(event.target.value)}
                    onKeyPress={onNameKeyPress}
                    placeholder="Name of the game"
                    bg={useColorModeValue("white", "gray.800")}
                    size="lg"
                />
                <Button
                    variant="solid"
                    colorScheme="teal"
                    ml="1rem"
                    size="lg"
                    onClick={() => searchGame(name)}
                    isLoading={loading}
                >
                    Search
                </Button>
            </Flex>
            {currentGame &&
                <GameProvider game={currentGame} setGame={setGame} removeGame={removeGame} >
                    <AddGameModal show={isOpen} onClose={onCloseModal} />
                </GameProvider>
            }
        </>
    )
}
