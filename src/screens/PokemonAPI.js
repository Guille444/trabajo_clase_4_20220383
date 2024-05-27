import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, Alert } from 'react-native';

export default function PokemonAPI() {
  const [pokemonCount, setPokemonCount] = useState(20);
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPokemons();
  }, [pokemonCount]);

  const fetchPokemons = async () => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonCount}`);
      const data = await response.json();
      console.log('Pokemon list response:', data.results);
      const detailedData = await Promise.all(
        data.results.map(async (pokemon) => {
          const pokemonDetailsResponse = await fetch(pokemon.url);
          const pokemonDetails = await pokemonDetailsResponse.json();
          return {
            id: pokemonDetails.id,
            name: pokemonDetails.name,
            sprite: pokemonDetails.sprites.front_default,
            abilities: pokemonDetails.abilities.map(ability => ability.ability.name).join(', '),
            description: await fetchPokemonDescription(pokemonDetails.id),
          };
        })
      );
      console.log('Detailed Pokemon data:', detailedData);
      setPokemons(detailedData);
    } catch (error) {
      console.error('Error fetching Pokemons:', error);
      Alert.alert('Error', 'Error fetching Pokemons. Please try again.');
    }
  };

  const fetchPokemonDescription = async (id) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
      const data = await response.json();
      const flavorText = data.flavor_text_entries.find(entry => entry.language.name === 'en');
      return flavorText ? flavorText.flavor_text : 'No description available.';
    } catch (error) {
      console.error('Error fetching Pokemon description:', error);
      return 'No description available.';
    }
  };

  const filteredPokemons = pokemons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderPokemonCard = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.sprite }} style={styles.image} />
      <Text style={styles.name}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
      <Text style={styles.details}>Abilities: {item.abilities}</Text>
      <Text style={styles.details}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Pokemones usando Fetch</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese la cantidad de pokemon a cargar:"
        keyboardType="numeric"
        onChangeText={(text) => setPokemonCount(Number(text))}
        defaultValue={pokemonCount.toString()}
      />
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre"
        onChangeText={(text) => setSearch(text)}
        value={search}
      />
      <FlatList
        data={filteredPokemons}
        renderItem={renderPokemonCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
    borderRadius: 5,
  },
  list: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  details: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
})