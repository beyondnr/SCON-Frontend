"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "../onboarding-context";

export default function Step1Account() {
  const { form } = useOnboarding();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold">사장님 계정 정보를 입력해주세요.</h2>
      <FormField
        control={form.control}
        name="account.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input placeholder="example@lawfulshift.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="account.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호</FormLabel>
            <FormControl>
              <Input type="password" placeholder="6자 이상 입력" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
