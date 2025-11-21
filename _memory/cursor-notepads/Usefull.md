# Usefull

# AI Workflow

- I kinda need a way to explain to a llm my workflow so it knows how to plan what im building. 
- New reusable prompt needed as slash commands (can be used with --dangerously-skip-permissions)
    - I want to begin implementation. After each step, test the step and generate a short step summary md file. Then start the next step. If tests fail, mention this in the summary file and iterate on it until it is fixed. If you need external docs, you have access to context7 mcp.
    - Begin implementation. After each step, test the step and generate a short step summary md file. Then start the next step. If tests fail, mention this in the summary file and iterate on it until it is fixed. 
- New agents needed
    - Have a git commit agent
    - Have a worker agent that executes implementation plans
    - Have a doc scraping agent



Let's begin the implementation. After each step, run tests, write tests but only if you need to and then generate a brief step summary md file. Then start the next step. If tests fail more than couple of times, and you already iterated the errors, you have access to updated external reference docs through the context7 MCP server. But use this carefully. 


Insert some stuff about my role in claude md
- Ex that im a product person not a programmer - if I want minimal code
- That i tend to overcomplicate so start simple and work our way up in complexity


ar fi misto un memory thread / agent care imi manageriaza un fisier despre evolutia si current status of a project. 

Ar fi misto si un seqrch across threads and across projects maybe? 
- Bundle two similar projects under one folder if they need cross references amd contexts

---

*Notepad ID: 59386eca-3a11-4977-9675-91a742b7b664*

*Created: 10/20/2025, 5:57:06 PM*

