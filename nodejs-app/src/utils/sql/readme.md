# What is a migration?

A migration is a way to alter the structure of a database. It is a way to keep track of changes to the database schema over time. Migrations are a way to make database changes in a consistent and repeatable way.

# Why use migrations?

Migrations are a way to keep track of changes to the database schema over time. They are particularly useful when working in a team environment, as they allow multiple developers to work on the application without interfering with each other.

# How to use migrations?

There is a script in the `package.json` file that allows you to handle migrations. You can run the following command to show the available options:

```bash
yarn sql
```

# What is have to know before?

## Environments

There are five layers of environments:

- **FS-Local**: This is our first two layers of environments. The first one is the file system and the second one is the local database. The file system is used to store the migration files. The local database is used to test the migrations and the application.
- **Development**: The development environment is used to share changes with the team. It is the first environment where you can test your changes in a shared environment.
- **Test**: The test environment is used to run the tests. It is a copy of the development environment.
- **Production**: The production environment is the real environment. It is used by the users.

  _It's not the REAL production environment, it's a copy of it. The real production usually has a different database on a different server. But this is our production environment for development purposes._

## What kind of actions can I do?

There are a few actions you can do with the environments:

- **FS - Local**
  - Create a new migration file pair. There are two files: one for the up action and one for the down.
  - Run migrations on local environment both up and down. This means **fs** can be migrated into **local**. **[fs -> local]**
  - Pull the missing migrations from your local db into the fs. **[fs <- local]**
  - Pull the latest migrations from the development environment. **[local <- development]**
- **Development**
  - Push the latest migrations to the development environment. **[local -> development]**
- **Test**
  - Push the latest migrations to the test environment. **[development -> test]**
- **Production**
  - Push the latest migrations to the production environment. **[test -> production]**

# How migration merge works?

To track the state of the migration merge process, the following table is used:

## Initial state

In the initial state, there are no migrations in any environment.

| FS  | Local | Development | Test | Production | Action-result |
| --- | ----- | ----------- | ---- | ---------- | ------------- |
| 0   | 0     | 0           | 0    | 0          |               |

## Create a new migration file pair

When you create a new migration file pair, the **fs** environment will be updated with the new migration files.

| FS  | Local | Development | Test | Production | Action-result                        |
| --- | ----- | ----------- | ---- | ---------- | ------------------------------------ |
| 0   | 0     | 0           | 0    | 0          | Create a new migration file pair     |
| 1   | 0     | 0           | 0    | 0          | Files are created in the file system |

_You can create multiple migration files at the same time. Each pair will be created in the file system, allowing you to make multiple changes to the database schema simultaneously._

## Run migrations on local environment up

When you run migrations on the local environment, the **Local** environment will be updated. This means that the changes specified in the migration files will be applied to the local database, altering its structure accordingly.

| FS  | Local | Development | Test | Production | Action-result                         |
| --- | ----- | ----------- | ---- | ---------- | ------------------------------------- |
| 0   | 0     | 0           | 0    | 0          | Create a new migration file pair      |
| 1   | 0     | 0           | 0    | 0          | Files are created in the file system  |
| 1   | 0     | 0           | 0    | 0          | Run migration up on local environment |
| 1   | 1     | 0           | 0    | 0          | Local environment is updated          |

_You can apply multiple migrations at the same time. The local environment will be updated accordingly._

## Run migrations on local environment down

When you run migrations on the local environment down, the **Local** environment will be updated. This means that the changes specified in the migration files will be reverted, altering the local database's structure accordingly.

| FS  | Local | Development | Test | Production | Action-result                           |
| --- | ----- | ----------- | ---- | ---------- | --------------------------------------- |
| 0   | 0     | 0           | 0    | 0          | Create a new migration file pair        |
| 1   | 0     | 0           | 0    | 0          | Files are created in the file system    |
| 1   | 0     | 0           | 0    | 0          | Run migration up on local environment   |
| 1   | 1     | 0           | 0    | 0          | Local environment is updated            |
| 1   | 1     | 0           | 0    | 0          | Run migration down on local environment |
| 1   | 0     | 0           | 0    | 0          | Local environment is updated            |

_You can apply multiple migrations at the same time. The local environment will be updated accordingly._

## Pull the missing migrations from your local db into the fs

When you pull the missing migrations from your local db into the fs, the **fs** environment will be updated. This means that the missing migration files will be created in the file system.


| FS  | Local | Development | Test | Production | Action-result                                              |
| --- | ----- | ----------- | ---- | ---------- | ---------------------------------------------------------- |
| 0   | 1     | 0           | 0    | 0          | There is a missing migration in the file system            |
| 1   | 1     | 0           | 0    | 0          | Pull the missing migrations from your local db into the fs |

_Multiple missing migrations can be pulled at the same time. The file system will be updated accordingly._

## Pull the latest migrations from the development environment

When you pull the latest migrations from the development environment, the **Local** and **fs** environment will be updated.

| FS  | Local | Development | Test | Production | Action-result                                             |
| --- | ----- | ----------- | ---- | ---------- | --------------------------------------------------------- |
| 1   | 1     | 1           | 0    | 0          | There are migration(s) in the development environment     |
| 1   | 1     | 2           | 0    | 0          | These migratins are pulled into the local environment     |
| 1   | 1     | 3           | 0    | 0          | These migratins are pulled into the file system too       |
| 2   | 2     | 3           | 0    | 0          | Local and file system environments are updated to state 2 |
| 3   | 3     | 3           | 0    | 0          | Local and file system environments are updated to state 3 |

_Multiple migrations can be pulled at the same time. The local and file system environments will be updated accordingly._

## Push the latest migrations to the development environment

When you push the latest migrations to the development environment, the **Development** environment will be updated.

| FS  | Local | Development | Test | Production | Action-result                                               |
| --- | ----- | ----------- | ---- | ---------- | ----------------------------------------------------------- |
| 3   | 3     | 0           | 0    | 0          | There are migration(s) in the local environment             |
| 3   | 3     | 0           | 0    | 0          | These migratins are pushed into the development environment |
| 3   | 3     | 1           | 0    | 0          | Development environment is updated to state 1               |
| 3   | 3     | 2           | 0    | 0          | Development environment is updated to state 2               |
| 3   | 3     | 3           | 0    | 0          | Development environment is updated to state 3               |

_You can push multiple migrations at the same time. The development environment will be updated accordingly._

## Push the latest migrations to the test environment

When you push the latest migrations to the test environment, the **Test** environment will be updated.

| FS  | Local | Development | Test | Production | Action-result                                         |
| --- | ----- | ----------- | ---- | ---------- | ----------------------------------------------------- |
| 3   | 3     | 3           | 0    | 0          | There are migration(s) in the development environment |
| 3   | 3     | 3           | 0    | 0          | These migratins are pushed into the test environment  |
| 3   | 3     | 3           | 1    | 0          | Test environment is updated to state 1                |
| 3   | 3     | 3           | 2    | 0          | Test environment is updated to state 2                |
| 3   | 3     | 3           | 3    | 0          | Test environment is updated to state 3                |

_You can push multiple migrations at the same time. The test environment will be updated accordingly._

## Push the latest migrations to the production environment

When you push the latest migrations to the production environment, the **Production** environment will be updated.

| FS  | Local | Development | Test | Production | Action-result                                              |
| --- | ----- | ----------- | ---- | ---------- | ---------------------------------------------------------- |
| 3   | 3     | 3           | 3    | 0          | There are migration(s) in the test environment             |
| 3   | 3     | 3           | 3    | 0          | These migratins are pushed into the production environment |
| 3   | 3     | 3           | 3    | 1          | Production environment is updated to state 1               |
| 3   | 3     | 3           | 3    | 2          | Production environment is updated to state 2               |
| 3   | 3     | 3           | 3    | 3          | Production environment is updated to state 3               |

_You can push multiple migrations at the same time. The production environment will be updated accordingly._

## Conflict

When there is a conflict, the migration merge process will be stopped. The conflict has to be resolved manually.

### How conflicts can happen?

There is a new person in this example. In this example, "OD" refers to the Other Developer. Check the following tables to see how the conflict can happen.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | ------------- |
| 0   | 0     | 0     | 0        | 0           | 0    | 0          |               |

OD creates a new migration file pair and you do the same thing.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | ------------- |
| 1   | 0     | 1     | 0        | 0           | 0    | 0          |               |

As you can see, your **fs** environment is updated. OD's **fs** environment is updated too. There is no confilct yet. You run the migration up on the local environment and OD does the same thing.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result    |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | ---------------- |
| 1   | 0     | 1     | 0        | 0           | 0    | 0          | Push fs to local |
| 1   | 1     | 1     | 1        | 0           | 0    | 0          |                  |

There is no confict yet but you have to pull the latest migrations from the development environment. OD does the same thing.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result       |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | ------------------- |
| 1   | 1     | 1     | 1        | 0           | 0    | 0          | Push local to dev   |
| 1   | 1     | 1     | 1        | ?           | 0    | 0          | There is a conflict |

This is a simple case because the migration files are created with a timestamp. So we will check the timestamp and we will see which one is the latest and run them in the correct order.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result        |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | -------------------- |
| 1   | 1     | 1     | 1        | 0           | 0    | 0          | Check the timestamps |
| 1   | 1     | 1     | 1        | OD's 1      | 0    | 0          | Find the first one   |
| 1   | 1     | 1     | 1        | Your 1      | 0    | 0          | Find the next one(s) |

### But when the conflict is not simple?

When the conflict is not simple, you have to fix it manually. You can do it through the migration files. You can handle data loss too. See the following example.

| FS  | Local | OD-FS | OD-Local | Development | Test | Production | Action-result                                                  |
| --- | ----- | ----- | -------- | ----------- | ---- | ---------- | -------------------------------------------------------------- |
| 4   | 4     | 3     | 3        | OD's 3      | 0    | 0          | OD pushes the latest migrations to the development environment |
| 4   | 4     | 3     | 3        | OD's 3      | 0    | 0          | You push the latest migrations to the development environment  |
| ... | ...   | ...   | ...      | ...         | ...  | ...        | ...                                                            |

There is a conflict. Your 4th migration creates a table and fills it with some data. When you try to push your changes into development, we have to pull changes from dev before syncing your local environment and then merge your changes to development. How does this happen? Let's continue and check the process...

| ... | ...    | ... | ... | ...    | ... | ... | ...                                                                    |
| --- | ------ | --- | --- | ------ | --- | --- | ---------------------------------------------------------------------- |
| 4   | 1      | 3   | 3   | OD's 3 | 0   | 0   | First your local will be rolled back the point where news found in dev |
| 4   | OD's 1 | 3   | 3   | OD's 3 | 0   | 0   | Run changes on your local without create the files on fs               |
| 4   | 2      | 3   | 3   | OD's 3 | 0   | 0   | Run the following change on your local                                 |
| ... | ...    | ... | ... | ...    | ... | ... | Repeat until your local will be synced with dev.                       |
| 4   | OD'3 3 | 3   |     | OD's 3 | 0   | 0   | In this point your local is synced and continoue with your changes     |
| 4   | 4      | 3   | 3   | 4      | 0   | 0   | Your 4th migration is pushed up to development.                        |

### And how can I solve the data loss?

There is two simple option:
- Save your database so if there is a problem you can backup it.
- Create new migration file and mark it as "backup". In this case the changes in the "backup" files will be executed on your local environment.
