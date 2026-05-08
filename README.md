# Aula 02 — Componentes e Estilos

## Objetivos da Aula

Criar componentes reutilizáveis com Flexbox mobile, aplicar `StyleSheet` avançado e integrar ícones com `@expo/vector-icons` e React Native Paper.

---

## O Projeto desta Aula

A partir desta aula, começamos a construir o **minhas-financas** — um app de gerenciamento financeiro pessoal que evoluirá ao longo de todo o módulo.

Ao final da Aula 4, você terá um app real, funcional e publicável.

---

## StyleSheet Avançado

### Organização de estilos

Em projetos maiores, manter todos os estilos em um único `StyleSheet` no final do arquivo já não é suficiente. A melhor prática é criar arquivos de tema e reutilizar variáveis:

```jsx
// theme.js — cores e tamanhos globais
export const cores = {
  primaria: '#2ecc71',   // verde — receitas
  perigo: '#e74c3c',     // vermelho — despesas
  fundo: '#f5f6fa',
  cartao: '#ffffff',
  texto: '#2c3e50',
  subtexto: '#7f8c8d',
};

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
// Usando o tema no componente:
import { cores, espacamento } from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacamento.md,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacamento.sm,
  },
});
```

### Composição de estilos com arrays

No React Native você pode passar um **array de estilos** — o último tem prioridade:

```jsx
// Estilo base + variação condicional:
<View style={[styles.cartao, isDestacado && styles.cartaoDestacado]}>
  <Text style={[styles.texto, { color: valor > 0 ? '#2ecc71' : '#e74c3c' }]}>
    R$ {valor}
  </Text>
</View>

const styles = StyleSheet.create({
  cartao: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cartaoDestacado: {
    borderWidth: 2,
    borderColor: '#2ecc71',
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Flexbox Mobile

O React Native usa Flexbox por padrão em **todos** os componentes. A diferença crítica em relação ao CSS web:

| Propriedade | CSS Web | React Native |
|-------------|---------|--------------|
| `flexDirection` padrão | `row` | **`column`** |
| Unidades | `px`, `%`, `rem` | apenas números (dp) |
| `display: flex` | precisa declarar | **sempre ativo** |

### As propriedades mais usadas

```jsx
<View style={{
  flex: 1,                        // ocupa todo o espaço disponível
  flexDirection: 'row',           // filhos lado a lado (padrão: 'column')
  justifyContent: 'space-between',// eixo principal: início, fim, centro, espaço
  alignItems: 'center',           // eixo cruzado: centro, início, fim, stretch
  flexWrap: 'wrap',               // quebra linha quando não cabe
  gap: 8,                         // espaço entre filhos (RN 0.71+)
}}>
```

---

## Componentes Reutilizáveis

### CartaoSaldo

Exibe o saldo total com cor dinâmica (verde se positivo, vermelho se negativo). Usa `Math.abs()` para sempre mostrar o número positivo e operador ternário para selecionar a cor.

### ItemTransacao

Cada linha da lista: ícone de categoria, descrição, data e valor. Usa `flex: 1` na área de texto para empurrar o valor para a borda direita, e `numberOfLines={1}` para truncar descrições longas.

> **Atividade prática:** O código completo de `CartaoSaldo`, `CardsResumo`, `ItemTransacao` e `theme.js` está no [conteúdo complementar](./STEPS.md).

---

## Sombras no Android e iOS

O React Native usa propriedades diferentes para sombra em cada plataforma:

```jsx
const styles = StyleSheet.create({
  card: {
    // Sombra no iOS:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Sombra no Android:
    elevation: 2,
  },
});
```

> `elevation` não existe no iOS; `shadowColor` e companhia não funcionam no Android. Use os dois blocos juntos para ter sombra em ambas as plataformas.

---

## Operadores Úteis no React Native

### Nullish Coalescing (`??`)

```jsx
const nomeIcone = ICONES[categoria] ?? 'ellipsis-horizontal-circle';
// Retorna o lado direito apenas se o esquerdo for null ou undefined
// (diferente do ||, que também ativa para '', 0 e false)
```

### Optional Chaining (`?.`)

```jsx
latitude: localizacao?.latitude ?? null
// Acessa latitude apenas se localizacao não for null/undefined
```

### `numberOfLines`

```jsx
<Text numberOfLines={1}>{descricao}</Text>
// Trunca o texto com "..." após 1 linha — evita quebrar o layout
```

---

## Calculando Totais com filter + reduce

Padrão recorrente no app financeiro:

```jsx
const receitas = transacoes
  .filter(t => t.tipo === 'receita')   // filtra apenas receitas
  .reduce((acc, t) => acc + t.valor, 0); // soma os valores (começa em 0)

const despesas = transacoes
  .filter(t => t.tipo === 'despesa')
  .reduce((acc, t) => acc + t.valor, 0);

const saldo = receitas - despesas;
```

O `reduce` recebe dois parâmetros: a função acumuladora `(acc, item) => novoAcc` e o **valor inicial** (`0`). Sem o valor inicial, o reduce usaria o primeiro elemento como ponto de partida, o que quebraria se a lista estivesse vazia.

---

## Ícones com @expo/vector-icons

O Expo já inclui o `@expo/vector-icons` — não precisa instalar nada extra.

### Famílias disponíveis

| Biblioteca | Quando usar |
|------------|-------------|
| `Ionicons` | Interface geral — recomendada para iniciantes |
| `MaterialIcons` | Estilo Google/Material Design |
| `FontAwesome` | Ícones clássicos da web |
| `Feather` | Ícones modernos e minimalistas |

### Como usar

```jsx
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

// Básico:
<Ionicons name="home" size={24} color="#333" />

// Com estilo:
<Ionicons name="add-circle" size={32} color="#2ecc71" style={{ marginRight: 8 }} />

// Em um botão:
<TouchableOpacity onPress={handleAdicionar}>
  <Ionicons name="add" size={28} color="#fff" />
</TouchableOpacity>
```

> **Dica:** Pesquise ícones disponíveis em [icons.expo.fyi](https://icons.expo.fyi)

---

## React Native Paper

O React Native Paper é uma biblioteca de componentes no estilo Material Design, pronta para uso em produção.

### Instalação

```bash
npm install react-native-paper
```

### Configuração

```jsx
// App.js — envolva tudo com o PaperProvider:
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      {/* resto do app */}
    </PaperProvider>
  );
}
```

### Componentes úteis para o minhas-financas

```jsx
import { Button, Chip, Card, Divider } from 'react-native-paper';

// Botão estilizado:
<Button mode="contained" onPress={handleSalvar} icon="check">
  Salvar Transação
</Button>

// Chips para categorias:
<Chip icon="restaurant" onPress={() => setCategoria('alimentacao')}>
  Alimentação
</Chip>

// Card com elevação:
<Card style={{ margin: 16 }}>
  <Card.Title title="Resumo do Mês" />
  <Card.Content>
    <Text>Receitas: R$ 3.200,00</Text>
  </Card.Content>
</Card>
```

---

## Imagens no React Native

```jsx
import { Image } from 'react-native';

// Imagem local (dentro do projeto):
<Image
  source={require('./assets/logo.png')}
  style={{ width: 120, height: 60 }}
  resizeMode="contain"
/>

// Imagem remota (URL):
<Image
  source={{ uri: 'https://exemplo.com/imagem.jpg' }}
  style={{ width: 200, height: 200, borderRadius: 100 }}
/>
```

| `resizeMode` | Comportamento |
|--------------|---------------|
| `cover` | Preenche sem distorcer (pode cortar) |
| `contain` | Mostra inteiro sem cortar |
| `stretch` | Estica para preencher (pode distorcer) |
| `center` | Centraliza no tamanho original |

---

## Projeto Demo em Sala

O diretório `minhas-financas/` (iniciado nesta aula e evoluído nas próximas) contém a tela principal do app com dados estáticos.

### Como rodar

```bash
cd minhas-financas
npm install
npx expo start
```

### O que o demo mostra

| Seção | Conceito demonstrado |
|-------|----------------------|
| CartaoSaldo | Flexbox, StyleSheet, props, lógica condicional |
| CardsResumo | `flexDirection: 'row'`, `flex: 1` em filhos |
| Lista de transações | Componente ItemTransacao, `@expo/vector-icons`, ScrollView |
| Categorias com ícones | Mapeamento de categoria → ícone Ionicons |

### Estrutura do projeto demo

```
minhas-financas/
├── App.js                  # Tela principal montada
├── components/
│   ├── CartaoSaldo.js      # Card de saldo total
│   ├── CardsResumo.js      # Cards de receitas e despesas
│   └── ItemTransacao.js    # Item individual da lista
├── theme.js                # Cores e espaçamentos globais
├── app.json
└── package.json
```

---

---

#### Prepare o Ambiente Local — Obrigatório para a Aula 4

As **aulas 1, 2 e 3** podem ser feitas no [snack.expo.dev](https://snack.expo.dev). A partir da **Aula 4**, o Snack não é mais suficiente: SQLite, Geolocalização e Mapas exigem ambiente nativo instalado localmente.

**Use o tempo desta aula para instalar o que falta:**

| Item | Status |
|---|---|
| Node.js 20.x instalado | [ ] |
| VS Code instalado | [ ] |
| Expo CLI instalado (`npm install -g expo-cli`) | [ ] |
| Android Studio instalado | [ ] |
| AVD criado (Pixel 8 / Android 14) | [ ] |
| Expo Go instalado no celular | [ ] |

Siga o passo a passo completo em [aula1/README.md](../aula1/README.md#configurando-o-android-studio-avd-emulador).

> **O Android Studio é o passo mais demorado** (download ~1 GB + configuração do AVD). Inicie a instalação enquanto acompanha a aula.

---


## Referências

- [Documentação oficial do StyleSheet](https://reactnative.dev/docs/stylesheet)
- [Guia de Flexbox — React Native](https://reactnative.dev/docs/flexbox)
- [Buscador de ícones — icons.expo.fyi](https://icons.expo.fyi)
- [React Native Paper — componentes](https://callstack.github.io/react-native-paper/docs/components/)
