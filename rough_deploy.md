I have the following errors on trying to deploy my next.js application: Failed to compile.
1177:37  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
1177:44  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
75:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
245:33  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
407:6  Warning: React Hook useEffect has a missing dependency: 'positionedNodes'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
560:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
./src/lib/csvHelper.ts
2:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
10:88  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
./src/types/api.ts
19:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
27:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
Error: Command "next build" exited with 1
Exiting build container

I will submit to you all the files where this errors are present, you will explain to me the error and do a fix in the component and send the complete code of the component fixed that i will jsut copy and paste


------------------- image
Look at this compoent that enables to visualize graph of interactionsof individuals based on their listing. I want that after the visualization someone should be able to print it as an image or a pdf  to exploit it later. How do i proceed to do that ? 