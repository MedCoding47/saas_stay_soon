import { motion } from 'framer-motion';

const cards = [
  {
    icon: '❤️',
    title: 'Pourquoi adopter ?',
    desc: 'N\'achetez pas — des milliers d\'animaux errants dans les rues du Maroc attendent une famille. Adopter, c\'est sauver une vie.',
    bg: 'from-coral/10 to-amber/10',
    iconBg: 'bg-coral/20',
  },
  {
    icon: '⚕️',
    title: 'La stérilisation sauve des vies',
    desc: 'Un couple de chats peut engendrer 20 chatons par an. Stériliser, c\'est réduire la souffrance animale dans nos villes.',
    bg: 'from-teal/10 to-emerald/10',
    iconBg: 'bg-teal/20',
  },
  {
    icon: '📱',
    title: 'Collier QR code — identification moderne',
    desc: 'Fini le tatouage. Chaque animal adopté reçoit un collier QR code. Perdu ? Scannez → WhatsApp → retrouvé rapidement.',
    bg: 'from-amber/10 to-coral/10',
    iconBg: 'bg-amber/20',
  },
  {
    icon: '🐾',
    title: 'Adopter = sauver deux vies',
    desc: 'Celle de l\'animal que vous accueillez, et celle du prochain qui prendra sa place libérée au refuge.',
    bg: 'from-coral/10 to-teal/10',
    iconBg: 'bg-coral/20',
  },
];

export default function EducationSection() {
  return (
    <section className="py-20 bg-warm-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Pourquoi adopter ?</h2>
          <p className="mt-3 text-muted max-w-lg mx-auto">
            Des gestes simples qui changent des vies — pour vous et pour eux.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${card.bg} rounded-3xl p-6 border border-warm-dark/50`}
            >
              <div className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center text-xl mb-4`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
