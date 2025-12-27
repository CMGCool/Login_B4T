// "use client";

// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signInFormSchema } from "@/lib/form-schema";
// import {Form,FormField,FormItem,FormControl,FormMessage,} from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { login } from "@/lib/auth";
// import Link from "next/link";

// export default function SigninPage() {
//   const form = useForm<z.infer<typeof signInFormSchema>>({
//     resolver: zodResolver(signInFormSchema),
//   });

//   const onSubmit = (values: z.infer<typeof signInFormSchema>) => {
//     console.log(values);
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="w-full max-w-sm border border-border p-6 rounded-md">
//         <h1 className="text-2xl font-semibold text-center mb-2">
//           Login your account
//         </h1>
//         <p className="text-sm text-muted-foreground text-center mb-6">
//           Enter your email and password
//         </p>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4"
//           >
    
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input
//                       placeholder="Email"
//                       type="email"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input
//                       placeholder="Password"
//                       type="password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button type="submit" className="w-full">
//               Sign In
//             </Button>
//             <div className="text-sm text-muted-foreground">
//                 Don&apos;t have an account?{" "}
//             <Link href="/auth/Signup" className="text-primary underline-offset-4 hover:underline">Sign up</Link>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInFormSchema } from "@/lib/form-schema";
import { login } from "@/lib/auth";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (
  values: z.infer<typeof signInFormSchema>
) => {
  try {
    setLoading(true);
    setError(null);

    const res = await login(values);
    localStorage.setItem("token", res.token);
    router.push("/dashboard");

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Login failed");
    } else {
      setError("Login failed");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm border border-border p-6 rounded-md">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Login your account
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your email and password
        </p>

        {error && (
          <p className="text-sm text-red-600 text-center mb-3">
            {error}
          </p>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter your Email" 
                    type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter your Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/Signup"
                className="text-primary hover:underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


