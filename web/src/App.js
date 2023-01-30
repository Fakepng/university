import { useState, useEffect } from "react";
import {
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
  Select,
  Text,
} from "@chakra-ui/react";

import university from "./university.json";

function App() {
  const [uni, setUni] = useState([]);
  const [selectUni, setSelectUni] = useState("");
  const [state, setState] = useState(0);
  const [faculties, setFaculties] = useState([]);
  const [selectFaculty, setSelectFaculty] = useState("");
  const [major, setMajor] = useState([]);
  const [selectMajor, setSelectMajor] = useState("");

  const handleUniChange = (event) => {
    event.target.value ? setState(1) : setState(0);
    setSelectUni(event.target.value);
    setSelectFaculty("");
    setSelectMajor("");
  };

  const handleFacChange = (event) => {
    event.target.value ? setState(2) : setState(1);
    setSelectFaculty(event.target.value);
    setSelectMajor("");
  };

  const handleMajorChange = (event) => {
    event.target.value ? setState(3) : setState(2);
    setSelectMajor(event.target.value);
  };

  useEffect(() => {
    const uniArray = [];
    for (const uni of university) {
      uniArray.push(Object.keys(uni)[0]);
    }
    setUni(uniArray);
  }, []);

  useEffect(() => {
    if (selectUni) {
      const facArray = [];
      for (const fac of university[uni.indexOf(selectUni)][selectUni]) {
        facArray.push(Object.keys(fac)[0]);
      }
      setFaculties(facArray);
    }
  }, [selectUni]);

  useEffect(() => {
    if (selectFaculty) {
      const majorArray = [];
      for (const major of university[uni.indexOf(selectUni)][selectUni][
        faculties.indexOf(selectFaculty)
      ][selectFaculty]) {
        majorArray.push(major);
      }
      setMajor(majorArray);
    }
  }, [selectFaculty]);

  return (
    <>
      <Center m={10}>
        <Heading>University</Heading>
      </Center>
      <Container>
        <Grid gridTemplateColumns={"1fr 9fr"} gap={6}>
          <GridItem w="100%" h="10">
            <Text fontSize="2xl" align="right">
              University
            </Text>
          </GridItem>
          <GridItem w="100%" h="10">
            <Select
              placeholder="Select University"
              value={selectUni}
              onChange={handleUniChange}
            >
              {uni.map((u) => (
                <option value={u} key={u}>
                  {u}
                </option>
              ))}
            </Select>
          </GridItem>
          <GridItem w="100%" h="10">
            <Text fontSize="2xl" align="right">
              Faculty
            </Text>
          </GridItem>
          <GridItem w="100%" h="10">
            <Select
              placeholder="Select Faculty"
              isDisabled={state < 1}
              value={selectFaculty}
              onChange={handleFacChange}
            >
              {faculties.map((f) => (
                <option value={f} key={f}>
                  {f}
                </option>
              ))}
            </Select>
          </GridItem>
          <GridItem w="100%" h="10">
            <Text fontSize="2xl" align="right">
              Major
            </Text>
          </GridItem>
          <GridItem w="100%" h="10">
            <Select
              placeholder="Select Major"
              isDisabled={state < 2}
              value={selectMajor}
              onChange={handleMajorChange}
            >
              {major.map((m) => (
                <option value={m} key={m}>
                  {m}
                </option>
              ))}
            </Select>
          </GridItem>
        </Grid>
      </Container>
    </>
  );
}

export default App;
