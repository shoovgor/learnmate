import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import MainNavigation from '@/components/MainNavigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Нэр дор хаяж 2 тэмдэгт байх ёстой" }),
  email: z.string().email({ message: "Хүчинтэй имэйл хаяг оруулна уу" }),
  subject: z.string().min(5, { message: "Сэдэв дор хаяж 5 тэмдэгт байх ёстой" }),
  message: z.string().min(10, { message: "Зурвас дор хаяж 10 тэмдэгттэй байх ёстой" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log("Form data:", data);
    toast({
      title: "Зурвас илгээгдлээ",
      description: "Бид тантай аль болох хурдан холбогдох болно.",
    });
    form.reset();
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Е-мэйл",
      description: "Ерөнхий лавлагаа",
      details: [
        { text: "purevjav.dgl@gmail.com", href: "mailto:purevjav.dgl@gmail.com" },
        { text: "tuvshuu612@gmail.com", href: "mailto:tuvshuu612@gmail.com" },
      ],
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Бидэнтэй холбогдох",
      description: "Өдөр бүр хэзээд бэлэн",
      details: [
        { text: "+976 9561 3508", href: "tel:+976 9561 3508" },
        { text: "+976 9925 8351", href: "tel:+976 9925 8351" },
      ],
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Хаяг",
      description: "Бидний байрлал",
      details: [
        { text: "Орхон, Баян-Өндөр, Оюут баг, 8-р сургууль" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation /> {/* Navbar moved back to the top */}
      <main className="container mx-auto py-12 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Бидэнтэй холбогдоорой</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
            LearnMate-ийн талаар асуух зүйл байна уу? Бидэнтэй хамтран ажиллахыг хүсч байна уу? Бид тантай харилцахдаа таатай байх болно.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">{info.icon}</div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-primary hover:underline">
                      {detail.href ? <a href={detail.href}>{detail.text}</a> : detail.text}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Бидэнд мессеж илгээнэ үү</CardTitle>
              <CardDescription>
              Доорх маягтыг бөглөнө үү, бид тантай аль болох хурдан холбогдох болно.              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Нэр</FormLabel>
                          <FormControl>
                            <Input placeholder="Таны нэр" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Е-Мэйл</FormLabel>
                          <FormControl>
                            <Input placeholder="Таны Е-Мэйл хаяг" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сэдэв</FormLabel>
                        <FormControl>
                          <Input placeholder="Энэ юутай холбоотой вэ?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мессеж</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Таны мессеж..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full md:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Мессеж илгээх
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
