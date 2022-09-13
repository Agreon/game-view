import { Box, Text } from "@chakra-ui/react";
import { NextPage } from "next";

const Legal: NextPage = () => {
    return (
        <Box>
            <Text fontSize="2xl">Imprint</Text>

            <p>Daniel Huth<br />
            Im Langgarten 1<br />
            63589 Linsengericht</p>

            <Text fontSize="xl" mt="1rem">Contact</Text>
            <p>Phone: +49 (0) 1575 2474713<br />
            Mail: huth at duck.com</p>
        </Box>
    );
};

export default Legal;
