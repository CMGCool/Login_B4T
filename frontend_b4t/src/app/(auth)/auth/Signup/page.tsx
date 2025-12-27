// "use client";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { signUpFormSchema } from "@/lib/form-schema";

// import {
//   Form,
//   FormField,
//   FormItem,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// export default function SigninPage() {
//   const form = useForm<z.infer<typeof signUpFormSchema>>({
//     resolver: zodResolver(signUpFormSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = (values: z.infer<typeof signUpFormSchema>) => {
//     console.log(values);
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="w-full max-w-sm border border-border p-6 rounded-md">
//         <h1 className="text-2xl font-semibold text-center mb-2">
//           Sign up
//         </h1>
//         <p className="text-sm text-muted-foreground text-center mb-6">
//           Enter your Data to Access Dashboard
//         </p>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4"
//           >
//             <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                     <FormItem>
//                         <FormControl>
//                             <Input
//                             type="text"
//                             placeholder="Enter your Name"
//                             {...field}
//                             />
//                         </FormControl>
//                     <FormMessage />
//                     </FormItem>
//                 )}
//             />

//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <Input
//                       placeholder="Enter your Email"
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
//                       placeholder="Enter your Password"
//                       type="password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button type="submit" className="w-full">
//               Submit
//             </Button>
//             <div className="text-sm text-muted-foreground">
//                 Already Have an Account?{" "}
//             <Link href="/auth/Signin" className="text-blue-600 underline-offset-4">Sign in</Link>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpFormSchema } from "@/lib/form-schema";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { register } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = async (
    values: z.infer<typeof signUpFormSchema>
  ) => {
    try {
      setLoading(true);
      setError(null);

      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      router.push("/auth/Signin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Register failed");
      } else {
        setError("Register failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm border border-border p-6 rounded-md">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Create your account
        </h1>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Fill the form below to register
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
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
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
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
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (<p className="text-sm text-destructive">{error}</p>)}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign Up"}
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/auth/Signin"
                className="text-blue-600 underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

