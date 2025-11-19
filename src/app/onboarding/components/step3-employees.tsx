"use client";

import { useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "../onboarding-context";
import { X } from "lucide-react";

export default function Step3Employees() {
  const { form } = useOnboarding();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "employees",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-headline font-bold">함께 일하는 직원을 등록해주세요.</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", hourlyRate: 9860, role: "직원" })}
        >
          직원 추가
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <FormField
                control={form.control}
                name={`employees.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="김민준" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employees.${index}.hourlyRate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시급</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employees.${index}.role`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>역할</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="역할 선택" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="직원">직원</SelectItem>
                            <SelectItem value="매니저">매니저</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-8 text-muted-foreground"
              onClick={() => remove(index)}
              disabled={fields.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
         {form.formState.errors.employees?.root?.message && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.employees.root.message}</p>
         )}
      </div>
    </div>
  );
}
