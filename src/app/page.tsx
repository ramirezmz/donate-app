import { MercadoPagoConfig, Preference } from "mercadopago";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET!);

interface Donation {
  id: number;
  created_at: number;
  amount: number;
  message: string;
}

export default async function Home() {
  const donations: Donation[] = await supabase
    .from("donations")
    .select("*")
    .then(({ data }: any) => data as Donation[]); //eslint-disable-line @typescript-eslint/no-explicit-any

  async function donate(formData: FormData) {
    "use server";
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: "donation",
            title: formData.get("message") as string,
            quantity: 1,
            unit_price: Number(formData.get("amount")),
          },
        ],
      },
    });

    redirect(preference.sandbox_init_point!);
  }

  return (
    <section className="grid gap-12">
      <form action={donate} className="m-auto grid max-w-96 gap-6 border p-4">
        <Label className="grid gap-2">
          <span>Valor</span>
          <Input name="amount" type="number" />
        </Label>
        <Label className="grid gap-2">
          <span>Tua mensagem para doação</span>
          <Textarea name="message" />
        </Label>
        <Button type="submit">Enviar</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quantidade</TableHead>
            <TableHead className="text-right">Mensagem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => {
            return (
              <TableRow key={donation.id}>
                <TableCell className="font-bold">
                  {donation.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </TableCell>
                <TableCell className="text-right">{donation.message}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
