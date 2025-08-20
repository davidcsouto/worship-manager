const bcrypt = require('bcryptjs');
const { addMember, addMusic } = require('./database');

const seedDatabase = async () => {
  try {
    // Criar membros
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const members = [
      {
        name: 'João Silva',
        voiceType: 'Tenor',
        email: 'joao@banda.com',
        password: hashedPassword,
        accessLevel: 'admin'
      },
      {
        name: 'Maria Santos',
        voiceType: 'Soprano',
        email: 'maria@banda.com',
        password: hashedPassword,
        accessLevel: 'common'
      },
      {
        name: 'Pedro Costa',
        voiceType: 'Barítono',
        email: 'pedro@banda.com',
        password: hashedPassword,
        accessLevel: 'common'
      },
      {
        name: 'Ana Oliveira',
        voiceType: 'Contralto',
        email: 'ana@banda.com',
        password: hashedPassword,
        accessLevel: 'common'
      },
      {
        name: 'Carlos Lima',
        voiceType: 'Baixo',
        email: 'carlos@banda.com',
        password: hashedPassword,
        accessLevel: 'common'
      }
    ];

    // Adicionar membros ao banco
    const createdMembers = [];
    for (const member of members) {
      const createdMember = addMember(member);
      createdMembers.push(createdMember);
    }

    // Criar músicas
    const music = [
      {
        name: 'Amazing Grace',
        key: 'C',
        versionLink: 'https://youtube.com/watch?v=amazing-grace-c',
        lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I\'m found\nWas blind, but now I see',
        soloistId: createdMembers[0].id // João Silva (Tenor)
      },
      {
        name: 'How Great Thou Art',
        key: 'G',
        versionLink: 'https://youtube.com/watch?v=how-great-thou-art-g',
        lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars, I hear the rolling thunder\nThy power throughout the universe displayed',
        soloistId: createdMembers[1].id // Maria Santos (Soprano)
      },
      {
        name: 'It Is Well With My Soul',
        key: 'D',
        versionLink: 'https://youtube.com/watch?v=it-is-well-d',
        lyrics: 'When peace like a river attendeth my way\nWhen sorrows like sea billows roll\nWhatever my lot, Thou hast taught me to say\nIt is well, it is well with my soul',
        soloistId: createdMembers[2].id // Pedro Costa (Barítono)
      },
      {
        name: 'Great Is Thy Faithfulness',
        key: 'F',
        versionLink: 'https://youtube.com/watch?v=great-is-thy-faithfulness-f',
        lyrics: 'Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions, they fail not\nAs Thou hast been, Thou forever will be',
        soloistId: createdMembers[3].id // Ana Oliveira (Contralto)
      },
      {
        name: 'Be Thou My Vision',
        key: 'A',
        versionLink: 'https://youtube.com/watch?v=be-thou-my-vision-a',
        lyrics: 'Be Thou my vision, O Lord of my heart\nNaught be all else to me, save that Thou art\nThou my best thought, by day or by night\nWaking or sleeping, Thy presence my light',
        soloistId: createdMembers[4].id // Carlos Lima (Baixo)
      }
    ];

    // Adicionar músicas ao banco
    const createdMusic = [];
    for (const song of music) {
      const createdSong = addMusic(song);
      createdMusic.push(createdSong);
    }

    console.log('✅ Banco de dados populado com sucesso!');
    console.log(`📊 ${createdMembers.length} membros criados`);
    console.log(`🎵 ${createdMusic.length} músicas criadas`);
    
    return {
      members: createdMembers,
      music: createdMusic
    };
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
