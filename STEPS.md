# Passo a Passo — Construindo a Tela Principal do minhas-financas

**Módulo 06 — Aula 02**  
Prof. Marcelo Matos

> Siga cada passo na ordem. Ao final, você terá a tela principal do seu app financeiro funcionando no celular.

---

## O que você vai construir

Ao final deste tutorial, o app **minhas-financas** terá:

- Um **card de saldo total** com cor dinâmica (verde se positivo, vermelho se negativo)
- Dois **cards de resumo** lado a lado: Receitas e Despesas
- Uma **lista de transações** com ícone de categoria, descrição, data e valor
- Componentes separados e reutilizáveis (CartaoSaldo, CardsResumo, ItemTransacao)
- Tudo estilizado com Flexbox e um arquivo de tema centralizado

---

## Antes de Começar — Checklist

Antes de digitar qualquer código, confirme:

- [ ] Node.js instalado (`node -v` deve mostrar v18 ou superior)
- [ ] Expo CLI disponível (`npx expo --version`)
- [ ] VS Code aberto
- [ ] Expo Go instalado no celular (ou emulador Android configurado)
- [ ] Celular e computador na mesma rede Wi-Fi

---

## Passo 1 — Criar o Projeto

### 1.1 — Abra o terminal e crie o projeto

```bash
npx create-expo-app minhas-financas --template blank
cd minhas-financas
```

> ⚠️ **O `--template blank` é obrigatório.** Sem ele, o Expo cria um projeto com Expo Router e você verá uma tela "Welcome! Step 1: Try it" em vez do app — e os passos seguintes não vão funcionar. Se isso aconteceu, delete a pasta e recrie com o comando acima.

### 1.2 — Instale as dependências extras

```bash
npm install react-native-paper
```

> O `@expo/vector-icons` já vem instalado com o Expo — não precisa instalar separadamente.

> ⚠️ **Se aparecer o erro `Unable to resolve "react-native-paper"`** ao rodar o app, significa que este passo foi pulado. Pare o servidor (`Ctrl + C`), execute o comando acima e rode `npx expo start` novamente.

### 1.3 — Inicie o servidor de desenvolvimento

```bash
npx expo start
```

> 💡 **Dica — problemas de rede ao abrir no celular?** Se o Expo mostrar a tela **"Something went wrong"** ao escanear o QR code (geralmente porque o computador e o celular estão em redes diferentes, ou a rede Wi-Fi bloqueia conexões locais), reinicie o servidor com o parâmetro `--tunnel`:
>
> ```bash
> npx expo start --tunnel
> ```
>
> O modo tunnel cria uma conexão segura via internet (usando o ngrok), eliminando a necessidade de o celular estar na mesma rede que o computador. É mais lento, mas funciona em qualquer cenário de rede.

Pressione `a` para abrir no emulador Android, ou escaneie o QR code com o Expo Go no celular.

Você deve ver a tela padrão do Expo. Vamos substituí-la agora.

---

## Passo 2 — Criar o arquivo de tema

Um arquivo de tema centraliza as cores e espaçamentos do app. Qualquer mudança futura afeta todos os componentes de uma vez.

### 2.1 — Crie o arquivo `theme.js` na raiz do projeto

```javascript
// theme.js
export const cores = {
  primaria: '#2c3e50',       // azul escuro — fundo do card de saldo
  receita: '#2ecc71',        // verde — receitas
  despesa: '#e74c3c',        // vermelho — despesas
  receitaFundo: '#d5f5e3',   // verde claro — fundo do ícone de receita
  despesaFundo: '#fadbd8',   // vermelho claro — fundo do ícone de despesa
  fundo: '#f5f6fa',          // cinza muito claro — fundo da tela
  cartao: '#ffffff',         // branco — fundo dos cards
  texto: '#2c3e50',          // azul escuro — texto principal
  subtexto: '#95a5a6',       // cinza — texto secundário
  alerta: '#f39c12',         // laranja — avisos
};

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 99,
};
```

---

## Passo 3 — Criar o componente CartaoSaldo

Este componente exibe o saldo total com cor dinâmica.

### 3.1 — Crie a pasta `components`

No terminal (com o servidor Expo ainda rodando em outra aba):

```bash
mkdir components
```

### 3.2 — Crie o arquivo `components/CartaoSaldo.js`

```jsx
// components/CartaoSaldo.js
import { View, Text, StyleSheet } from 'react-native';
import { cores, espacamento, raio } from '../theme';

export function CartaoSaldo({ saldo, mes }) {
  const isPositivo = saldo >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saldo em {mes}</Text>
      <Text style={[styles.valor, { color: isPositivo ? cores.receita : cores.despesa }]}>
        R$ {Math.abs(saldo).toFixed(2)}
      </Text>
      {!isPositivo && (
        <Text style={styles.alerta}>⚠️ Saldo negativo</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cores.primaria,
    borderRadius: raio.lg,
    padding: espacamento.lg,
    marginHorizontal: espacamento.md,
    marginTop: espacamento.md,
    alignItems: 'center',
  },
  label: {
    color: '#bdc3c7',
    fontSize: 14,
    marginBottom: espacamento.sm,
  },
  valor: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  alerta: {
    color: cores.alerta,
    fontSize: 13,
    marginTop: espacamento.sm,
  },
});
```

**O que acontece aqui:**
- `Math.abs(saldo)` garante que o número exibido seja sempre positivo — a cor indica se é positivo ou negativo
- `isPositivo ? cores.receita : cores.despesa` é um operador ternário — seleciona a cor dinamicamente
- `!isPositivo && <Text>` só renderiza o aviso se o saldo for negativo

---

## Passo 4 — Criar o componente CardsResumo

Dois cards lado a lado mostrando receitas e despesas totais.

### 4.1 — Crie o arquivo `components/CardsResumo.js`

```jsx
// components/CardsResumo.js
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

export function CardsResumo({ receitas, despesas }) {
  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: cores.receitaFundo }]}>
        <Ionicons name="arrow-up-circle" size={24} color={cores.receita} />
        <Text style={styles.label}>Receitas</Text>
        <Text style={[styles.valor, { color: cores.receita }]}>
          R$ {receitas.toFixed(2)}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cores.despesaFundo }]}>
        <Ionicons name="arrow-down-circle" size={24} color={cores.despesa} />
        <Text style={styles.label}>Despesas</Text>
        <Text style={[styles.valor, { color: cores.despesa }]}>
          R$ {despesas.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',   // coloca os cards lado a lado
    gap: 12,
    marginHorizontal: espacamento.md,
    marginTop: espacamento.md,
  },
  card: {
    flex: 1,               // cada card ocupa metade da largura
    padding: espacamento.md,
    borderRadius: raio.md,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: cores.texto,
    marginTop: 4,
  },
  valor: {
    fontSize: 18,
    fontWeight: '700',
  },
});
```

**O que acontece aqui:**
- `flexDirection: 'row'` coloca os dois cards lado a lado (diferente do padrão `column`)
- `flex: 1` em cada card faz com que ambos ocupem exatamente metade da largura
- `gap: 12` adiciona espaço entre eles sem precisar de `marginRight`/`marginLeft`

---

## Passo 5 — Criar o componente ItemTransacao

Cada linha da lista de transações.

### 5.1 — Crie o arquivo `components/ItemTransacao.js`

```jsx
// components/ItemTransacao.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

// Mapeamento de categoria para ícone Ionicons
const ICONES = {
  alimentacao: 'restaurant',
  transporte: 'car',
  saude: 'medical',
  lazer: 'game-controller',
  salario: 'cash',
  moradia: 'home',
  educacao: 'school',
  outros: 'ellipsis-horizontal-circle',
};

export function ItemTransacao({ descricao, valor, categoria, tipo, data, onPress }) {
  const isReceita = tipo === 'receita';
  const nomeIcone = ICONES[categoria] ?? 'ellipsis-horizontal-circle';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Ícone da categoria */}
      <View style={[
        styles.iconeContainer,
        { backgroundColor: isReceita ? cores.receitaFundo : cores.despesaFundo }
      ]}>
        <Ionicons
          name={nomeIcone}
          size={22}
          color={isReceita ? cores.receita : cores.despesa}
        />
      </View>

      {/* Descrição e data */}
      <View style={styles.info}>
        <Text style={styles.descricao} numberOfLines={1}>{descricao}</Text>
        <Text style={styles.data}>{data}</Text>
      </View>

      {/* Valor */}
      <Text style={[styles.valor, { color: isReceita ? cores.receita : cores.despesa }]}>
        {isReceita ? '+' : '-'} R$ {valor.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    padding: espacamento.md,
    marginBottom: espacamento.sm,
    // Sombra (iOS):
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Sombra (Android):
    elevation: 2,
  },
  iconeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,            // círculo perfeito (metade do width/height)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espacamento.md,
  },
  info: {
    flex: 1,                     // ocupa todo o espaço entre o ícone e o valor
  },
  descricao: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
  data: {
    fontSize: 12,
    color: cores.subtexto,
    marginTop: 2,
  },
  valor: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: espacamento.sm,
  },
});
```

**O que acontece aqui:**
- `??` (nullish coalescing) retorna o lado direito se o esquerdo for `null` ou `undefined`
- `numberOfLines={1}` trunca a descrição com `...` se for muito longa
- `flex: 1` no `info` faz ele crescer e empurrar o valor para a borda direita
- `elevation` é a propriedade de sombra no Android (não existe `boxShadow` no RN)

---

## Passo 6 — Montar a tela principal no App.js

Agora vamos juntar tudo no `App.js`.

### 6.1 — Substitua todo o conteúdo do `App.js` por:

```jsx
// App.js
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { CartaoSaldo } from './components/CartaoSaldo';
import { CardsResumo } from './components/CardsResumo';
import { ItemTransacao } from './components/ItemTransacao';
import { cores, espacamento } from './theme';

// Dados estáticos para demonstração (na Aula 4, virão do AsyncStorage)
const TRANSACOES = [
  { id: '1', descricao: 'Salário', valor: 3200, tipo: 'receita', categoria: 'salario', data: '01/04/2026' },
  { id: '2', descricao: 'Aluguel', valor: 900, tipo: 'despesa', categoria: 'moradia', data: '05/04/2026' },
  { id: '3', descricao: 'Supermercado', valor: 280.50, tipo: 'despesa', categoria: 'alimentacao', data: '07/04/2026' },
  { id: '4', descricao: 'Freelance', valor: 500, tipo: 'receita', categoria: 'salario', data: '10/04/2026' },
  { id: '5', descricao: 'Uber', valor: 35.90, tipo: 'despesa', categoria: 'transporte', data: '11/04/2026' },
  { id: '6', descricao: 'Academia', valor: 89.90, tipo: 'despesa', categoria: 'saude', data: '12/04/2026' },
];

export default function App() {
  // Calcula receitas, despesas e saldo
  const receitas = TRANSACOES
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const despesas = TRANSACOES
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = receitas - despesas;

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Cabeçalho */}
          <View style={styles.cabecalho}>
            <Text style={styles.tituloCabecalho}>Minhas Finanças</Text>
            <Text style={styles.subtituloCabecalho}>Abril 2026</Text>
          </View>

          {/* Card de saldo */}
          <CartaoSaldo saldo={saldo} mes="Abril" />

          {/* Cards de resumo */}
          <CardsResumo receitas={receitas} despesas={despesas} />

          {/* Lista de transações */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Transações Recentes</Text>
            {TRANSACOES.map(transacao => (
              <ItemTransacao
                key={transacao.id}
                descricao={transacao.descricao}
                valor={transacao.valor}
                tipo={transacao.tipo}
                categoria={transacao.categoria}
                data={transacao.data}
                onPress={() => console.log('Tocou em:', transacao.descricao)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.primaria, // cor escura no topo (status bar area)
  },
  scroll: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.lg,
  },
  tituloCabecalho: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtituloCabecalho: {
    color: '#bdc3c7',
    fontSize: 14,
    marginTop: 2,
  },
  secao: {
    padding: espacamento.md,
    marginTop: espacamento.sm,
  },
  tituloSecao: {
    fontSize: 17,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: espacamento.md,
  },
});
```

---

## Passo 7 — Verificar o resultado

Salve todos os arquivos. O Expo vai recarregar automaticamente.

**Você deve ver:**
- Cabeçalho azul escuro com "Minhas Finanças" e "Abril 2026"
- Card grande com o saldo calculado (R$ 1.493,70 em verde)
- Dois cards lado a lado: Receitas (R$ 3.700,00) e Despesas (R$ 2.206,30)
- Lista com 6 transações, cada uma com ícone colorido, descrição e valor

**Se o saldo for negativo**, o número aparece em vermelho e um aviso "⚠️ Saldo negativo" é exibido.

---

## Estrutura Final do Projeto

```
minhas-financas/
├── App.js                   # Tela principal
├── theme.js                 # Cores e espaçamentos globais
├── components/
│   ├── CartaoSaldo.js       # Card de saldo total
│   ├── CardsResumo.js       # Cards de receitas e despesas
│   └── ItemTransacao.js     # Item da lista de transações
├── assets/
├── app.json
└── package.json
```

---

## Resultado Final

| O que você vê | Como foi feito |
|---------------|----------------|
| Saldo em verde ou vermelho | Prop `saldo` + operador ternário |
| Cards lado a lado | `flexDirection: 'row'` + `flex: 1` |
| Ícones coloridos por categoria | `@expo/vector-icons` + mapeamento de objeto |
| Lista de transações | `.map()` com componente `ItemTransacao` |
| Valores calculados automaticamente | `.filter()` + `.reduce()` |

---

## Resolução de Problemas

### "Cannot find module '@expo/vector-icons'"
```bash
npx expo install @expo/vector-icons
```

### "Cannot find module 'react-native-paper'"
```bash
npm install react-native-paper
```

### Os cards não ficam lado a lado
Verifique se `flexDirection: 'row'` está no container pai (não nos cards filhos), e se cada card tem `flex: 1`.

### O saldo mostra muitas casas decimais
Use `.toFixed(2)` para limitar a 2 casas: `saldo.toFixed(2)`.

### A tela fica cortada no topo (status bar)
Verifique se o componente raiz é `<SafeAreaView>` e não `<View>`.

### O app não recarrega após salvar
Pressione `r` no terminal onde o Expo está rodando para forçar o reload.

### A interface web não carrega no navegador
Execute o comando abaixo para instalar as dependências necessárias para a versão web:
```bash
npx expo install react-dom react-native-web
```
