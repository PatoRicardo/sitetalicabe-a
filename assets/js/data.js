window.Site = window.Site || {};

window.Site.data = {
  profile: {
    name: 'Meu amor',
    sign: 'Com amor, para sempre',

    hero: {
      eyebrow: 'só para você',
      title: 'Para você,\nmeu amor',
      lead: 'Montei um cantinho com as suas fotos, com os versos que eu não consigo falar em voz alta e com um quebra-cabeça que escondi uma surpresa. Leva o tempo que precisar: tudo aqui foi feito com calma.',
      badges: ['fotos guardadas', 'versos escritos', 'uma surpresa no final'],
      photo: {
        src: 'assets/img/photos/foto-1.svg',
        alt: 'Foto de destaque no site',
        caption: 'a foto que eu usaria de fundo de tela'
      }
    },

    sections: {
      galeria: 'Uma seleção de fotos que eu guardo desde que te conheço.',
      poemas: 'Escrevi para ler baixinho, no máximo, porque se você ler em voz alta eu começo a gaguejar.',
      'quebra-cabeca': 'Esta foto foi cortada em pedaços e misturada. Junte tudo de volta — quando o retrato fechar, uma parte do site se abre.',
      segredos: 'Duas cartas que eu não tive coragem de mandar e algumas fotos que eu não coloquei na galeria.'
    },

    footer: 'Se você chegou até aqui, obrigada por ter lido tudo devagar.',
    year: ''
  },

  photos: [
    { src: 'assets/img/photos/foto-1.svg', alt: 'Placeholder da primeira foto', caption: 'aquele dia que não queria acabar', ratio: '4 / 5' },
    { src: 'assets/img/photos/foto-2.svg', alt: 'Placeholder da segunda foto', caption: 'sorriso novo demais', ratio: '1 / 1' },
    { src: 'assets/img/photos/foto-3.svg', alt: 'Placeholder da terceira foto', caption: 'luz de fim de tarde', ratio: '3 / 4' },
    { src: 'assets/img/photos/foto-4.svg', alt: 'Placeholder da quarta foto', caption: 'a pazinha de sempre', ratio: '4 / 5' },
    { src: 'assets/img/photos/foto-5.svg', alt: 'Placeholder da quinta foto', caption: 'noventa por cento de você, dez por cento de eu', ratio: '16 / 10' },
    { src: 'assets/img/photos/foto-6.svg', alt: 'Placeholder da sexta foto', caption: 'prova de que a gente se dá bem', ratio: '1 / 1' }
  ],

  hiddenPhotos: [
    { src: 'assets/img/photos/secreta-1.svg', alt: 'Placeholder da foto secreta 1', caption: 'esta eu nunca mostrei pra ninguém', ratio: '4 / 5' },
    { src: 'assets/img/photos/secreta-2.svg', alt: 'Placeholder da foto secreta 2', caption: 'o dia em que eu soube', ratio: '1 / 1' },
    { src: 'assets/img/photos/secreta-3.svg', alt: 'Placeholder da foto secreta 3', caption: 'só nossa, de novo', ratio: '3 / 4' }
  ],

  poems: [
    {
      title: 'O jeito que você chega',
      date: 'março',
      body: 'Você entra sem bater\ne o silêncio da casa aprende a core.\n\nFica mais leve o ar,\nfica mais leve o meu pior dia.\n\nE eu finjo que não reparei\nem você já ter entrado.',
      author: 'eu'
    },
    {
      title: 'Inventário',
      date: 'abril',
      body: 'Contei hoje as suas coisas:\n\num copo na mesa,\numa risada de quem acabou de ouvir uma piada boa,\num fio de cabelo no meu casaco,\na mania de fechar o que ninguém pediu.\n\nFiz a conta e deu o seguinte:\nguardar você custa pouco\ne vale todo o preço.',
      author: 'eu'
    },
    {
      title: 'Promessa pequena',
      date: 'maio',
      body: 'Vou te dar as manhãs,\nque são a parte mais difícil do dia.\n\nVocê fica com o resto:\nas horas, a espera, a rua, o que sobrar.\n\nE nos dias em que eu não der conta de nada,\nme faz um café e me lembra\nde que eu já fiz isso antes —\nde quando era mais novo e tinha o dobro de tudo.',
      author: 'eu'
    }
  ],

  puzzle: {
    photo: {
      src: 'assets/img/puzzle/retrato.svg',
      label: 'A foto',
      alt: 'Fotografia usada no quebra-cabeça'
    },
    defaultSize: 3,
    hintsPerGame: 3,
    tip: 'Toque em uma peça para erguer, toque em outra para trocar as duas. No computador você também pode arrastar.',
    status: {
      start: 'Escolha uma peça para começar.',
      selected: 'Agora toque na peça que vai trocar de lugar.',
      swap: 'Boa. Continue assim.',
      wrong: 'Quase! Essa peça pertence a outro canto.',
      full: 'Tudo no lugar!',
      solved: 'Você montou. A foto ficou inteira — e liberou a última parte do site.'
    }
  },

  secrets: {
    letters: [
      {
        title: 'A carta que eu nunca enviei',
        meta: 'escrita num caderno, às 2h da manhã',
        body: 'Eu comecei essa carta umas quatro vezes e nenhuma chegou ao fim, porque sempre que eu escrevia eu lembrava de tudo que você já sabe e me dava vergonha de repetir.\n\nEntão vai assim, sem desculpa:\n\nObrigada por ser a pessoa com quem eu quero perder uma tarde. Não um programa, não um plano, uma tarde mesmo — a que passa voando e que eu depois quero contar pra alguém.\n\nSe um dia você achar que eu me tornei distante, eu provavelmente só estou com sono. Mas se quiser, me pergunta de novo. Eu respondo. Sempre respondi.\n\nCom amor, mesmo quando eu não sei dizer.',
        sign: 'sempre eu'
      },
      {
        title: 'A lista do que eu faria de novo',
        meta: 'do jeito que eu realmente lembro',
        body: '1. A tarde chuvosa em que não saímos de lugar nenhum.\n\n2. A discussão boba sobre comida que a gente ama e que ninguém pediu.\n\n3. O dia em que eu fui grosseiro e você ficou mesmo assim mesmo.\n\n4. Todas as vezes que você me mandou bom dia e eu demorei a responder, mas respondi.\n\n5. E faria de novo, de novo, de novo — inclusive os dias chatos, que são os que eu menos contei e mais guardei.\n\nNão tem nada disso aqui que eu trocaria por outra coisa.',
        sign: 'seu'
      }
    ],
    finale: {
      text: 'A foto estava partida em pedaços,\ne era só uma foto mesmo.\nNenhuma imagem é grande o bastante para o que você é.',
      sign: 'obrigado por ter terminado comigo'
    }
  },

  music: null
};
