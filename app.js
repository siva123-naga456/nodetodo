const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());

let db = null;

const dbConnection = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    //app.listen(3000);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
dbConnection();

const hasPriorityAndStatus = (Query) => {
  //console.log(Query.priority !== undefined);
  return Query.priority !== undefined && Query.status !== undefined;
};

const hasCategoryAndStatus = (Query) => {
  return Query.category !== undefined && Query.status !== undefined;
};

const hasCategoryAndPriority = (Query) => {
  return Query.category !== undefined && Query.priority !== undefined;
};

const hasPriority = (Query) => {
  return Query.priority !== undefined;
};

const hasStatus = (Query) => {
  return Query.status !== undefined;
};

const hasCategory = (Query) => {
  return Query.category !== undefined;
};

const hasSearch = (Query) => {
  return Query.search_q !== undefined;
};

const outPutResult = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", category, priority, status } = request.query;
  let data = null;
  let getQuery = "";
  switch (true) {
    case hasPriorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getQuery = `select * from todo where priority='${priority}' and status='${status}'`;
          data = await db.all(getQuery);
          response.send(data.map((each) => outPutResult(each)));
        } else {
          response.status("400");
          response.send("Invalid Todo Status");
        }
      } else {
        response.status("400");
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndStatus(request.query):
      if (
        category === "LEARNING" ||
        category === "HOME" ||
        category === "WORK"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getQuery = `select * from todo where category='${category}' and status='${status}'`;
          data = await db.all(getQuery);
          response.send(data.map((each) => outPutResult(each)));
        } else {
          response.status("400");
          response.send("Invalid Todo Status");
        }
      } else {
        response.status("400");
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriority(request.query):
      if (
        category === "LEARNING" ||
        category === "HOME" ||
        category === "WORK"
      ) {
        if (
          priority === "HIGH" ||
          priority === "LOW" ||
          priority === "MEDIUM"
        ) {
          getQuery = `select * from todo where category='${category}' and priority='${priority}'`;
          data = await db.all(getQuery);
          response.send(data.map((each) => outPutResult(each)));
        } else {
          response.status("400");
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status("400");
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        getQuery = `select * from todo where priority='${priority}'`;
        data = await db.all(getQuery);
        response.send(data.map((each) => outPutResult(each)));
      } else {
        response.status("400");
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getQuery = `select * from todo where status='${status}'`;
        data = await db.all(getQuery);
        response.send(data.map((each) => outPutResult(each)));
      } else {
        response.status("400");
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategory(request.query):
      if (
        category === "LEARNING" ||
        category === "HOME" ||
        category === "WORK"
      ) {
        getQuery = `select * from todo where category='${category}'`;
        data = await db.all(getQuery);
        response.send(data.map((each) => outPutResult(each)));
      } else {
        response.status("400");
        response.send("Invalid Todo Category");
      }
      break;
    case hasSearch(request.query):
      getQuery = `select * from todo where todo like '%${search_q}%'`;
      data = await db.all(getQuery);
      response.send(data.map((each) => outPutResult(each)));
      break;
    default:
      getQuery = `select * from todo`;
      data = await db.all(getQuery);
      response.send(data.map((each) => outPutResult(each)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getResult = `select id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate from todo where id=${todoId}`;
  const result = await db.get(getResult);
  response.send(result);
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const resultQuery = `select * from todo where due_date='${formatDate}'`;
    const result = await db.all(resultQuery);
    response.send(result.map((each) => outPutResult(each)));
  } else {
    response.status("400");
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (category === "LEARNING" || category === "HOME" || category === "WORK") {
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postQuery = `insert into todo (id,todo,category,priority,status,due_date)values(${id},'${todo}','${priority}'
    '${status}','${category}','${postDate}')`;
          await db.run(postQuery);

          response.send("Todo Successfully Added");
        } else {
          response.status("400");
          response.send("Invalid Due Date");
        }
      } else {
        response.status("400");
        response.send("Invalid Todo Status");
      }
    } else {
      response.status("400");
      response.send("Invalid Todo Category");
    }
  } else {
    response.status("400");
    response.send("Invalid Todo Priority");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let requestBody = request.body;
  let putQuery = "";
  switch (true) {
    case requestBody.priority !== undefined:
      const { priority } = requestBody;
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        putQuery = `update todo set priority='${priority}' where id=${todoId}`;
        await db.run(putQuery);
        response.send("Priority Updated");
      } else {
        response.status("400");
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.status !== undefined:
      const { status } = requestBody;
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        putQuery = `update todo set status='${status}' where id=${todoId}`;
        await db.run(putQuery);
        response.send("Status Updated");
      } else {
        response.status("400");
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.category !== undefined:
      //console.log(requestBody.category !== undefined);
      const { category } = requestBody;
      if (
        category === "LEARNING" ||
        category === "HOME" ||
        category === "WORK"
      ) {
        putQuery = `update todo set category='${category}' where id=${todoId}`;
        await db.run(putQuery);
        response.send("Category Updated");
      } else {
        response.status("400");
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      const { dueDate } = requestBody;
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
        putQuery = `update todo set due_date='${formatDate}' where id=${todoId}`;
        await db.run(putQuery);
        response.send("Due Date Updated");
      } else {
        response.status("400");
        response.send("Invalid Due Date");
      }
      break;
    case requestBody.todo !== undefined:
      const { todo } = requestBody;
      putQuery = `update todo set todo='${todo}' where id=${todoId}`;
      await db.run(putQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id=${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
