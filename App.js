import { useState } from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


export default function App() {

  // useState — IDÊNTICO ao React.js ⚛️

  const [contador, setContador] = useState(0);


  return (

    <View style={styles.container}>


      {/* Cabeçalho */}

      <Text style={styles.titulo}>Olá, ITEAM! 🚀</Text>

      <Text style={styles.subtitulo}>Módulo 06 — Aula 01</Text>


      {/* Card do contador */}

      <View style={styles.card}>

        <Text style={styles.cardTitulo}>⚛️ useState — igual ao React.js</Text>


        {/* Número atual do contador */}

        <Text style={styles.contador}>{contador}</Text>


        {/* Linha de botões */}

        <View style={styles.botoes}>


          {/* Botão − (diminuir) */}

          <TouchableOpacity

            style={[styles.botao, styles.botaoCinza]}

            onPress={() => setContador(contador - 1)}

          >

            <Text style={styles.botaoTexto}>−</Text>

          </TouchableOpacity>


          {/* Botão Reset */}

          <TouchableOpacity

            style={[styles.botao, styles.botaoBranco]}

            onPress={() => setContador(0)}

          >

            <Text style={styles.botaoTextoReset}>Reset</Text>

          </TouchableOpacity>


          {/* Botão + (aumentar) */}

          <TouchableOpacity

            style={styles.botao}

            onPress={() => setContador(contador + 1)}

          >

            <Text style={styles.botaoTexto}>+</Text>

          </TouchableOpacity>


        </View>

      </View>


    </View>

  );

}


const styles = StyleSheet.create({

  container: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#f2f4f7',

    padding: 20,

  },

  titulo: {

    fontSize: 32,

    fontWeight: 'bold',

    color: '#ff9500',

    marginBottom: 4,

  },

  subtitulo: {

    fontSize: 14,

    color: '#777',

    marginBottom: 24,

  },

  card: {

    backgroundColor: '#fff',

    borderRadius: 14,      // cantos arredondados

    padding: 20,

    width: '100%',

    alignItems: 'center',

    elevation: 3,          // sombra no Android

    shadowColor: '#000',   // sombra no iOS

    shadowOpacity: 0.07,

    shadowRadius: 6,

  },

  cardTitulo: {

    fontSize: 15,

    fontWeight: '700',

    color: '#222',

    marginBottom: 16,

  },

  contador: {

    fontSize: 72,

    fontWeight: 'bold',

    color: '#ff9500',

    marginBottom: 16,

  },

  botoes: {

    flexDirection: 'row',  // coloca os botões lado a lado (como display:flex no CSS)

    gap: 12,               // espaço entre os botões

  },

  botao: {

    backgroundColor: '#ff9500',

    paddingHorizontal: 24,

    paddingVertical: 12,

    borderRadius: 10,

    minWidth: 60,

    alignItems: 'center',

  },

  botaoCinza: {

    backgroundColor: '#555',

  },

  botaoBranco: {

    backgroundColor: '#eee',

  },

  botaoTexto: {

    color: '#fff',

    fontSize: 22,

    fontWeight: 'bold',

  },

  botaoTextoReset: {

    color: '#555',

    fontSize: 15,

    fontWeight: '600',

  },

});
