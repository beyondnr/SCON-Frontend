"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../onboarding-context";

const businessTypes = ["베이커리", "국밥집", "꽃집", "카페", "편의점", "기타"];

export default function Step2Store() {
  const { form } = useOnboarding();

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-headline font-bold">매장 정보를 알려주세요.</h2>
      <FormField
        control={form.control}
        name="store.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>매장명</FormLabel>
            <FormControl>
              <Input placeholder="예: 행복 베이커리" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="store.businessType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>업종</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="업종을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="store.openingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>영업 시작 시간</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="store.closingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>영업 종료 시간</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
