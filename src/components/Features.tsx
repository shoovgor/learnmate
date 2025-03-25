import React from 'react';
import { Clock, Sparkles, BookOpen, BarChart3, Users, Calendar } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "Хиймэл оюун ухаант гэрийн даалгаврын туслах",
    description: "Гэрийн даалгаврын асуудлуудыг алхам алхмаар тайлбарлан шийдвэрлэх тусламж аваарай.",
    delay: "0s"
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: "Хувь хүнд тохирсон судалгааны төлөвлөгөө",
    description: "Таны суралцах хурд, зорилгод үндэслэн хиймэл оюун ухаанаар үүсгэсэн хуваарь.",
    delay: "0.1s"
  },
  {
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    title: "Ухаалаг шалгалтын үүсгүүр",
    description: "Таны суралцах хэрэгцээнд тохирсон шалгалтаар дадлага хий.",
    delay: "0.2s"
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: "Ахиц дэвшлийн шинжилгээ",
    description: "Гүйцэтгэлээ дэлгэрэнгүй мэдээлэл, зөвлөмжөөр хянаарай.",
    delay: "0.3s"
  },
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Хамтран суралцах",
    description: "Судалгааны бүлгүүдэд нэгдэж, бусад сурагчидтай хамтран ажиллаарай.",
    delay: "0.4s"
  },
  {
    icon: <Calendar className="w-6 h-6 text-primary" />,
    title: "Ухаалаг хуваарь гаргах",
    description: "Хиймэл оюун ухааны зөвлөмжөөр суралцах цагаа оновчтой болго.",
    delay: "0.5s"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary">Онцлог</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Таны суралцах үйл явцыг хурдасгаарай</h2>
          <p className="text-muted-foreground">
            Манай платформ хиймэл оюун ухааны технологийг батлагдсан сургалтын аргуудтай хослуулан таны академик амжилтыг дэмжинэ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:translate-y-[-5px]"
              style={{ animationDelay: feature.delay }}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
