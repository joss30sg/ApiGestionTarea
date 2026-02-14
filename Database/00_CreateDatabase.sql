/*
 Script: 00_CreateDatabase.sql
 Propósito: Crear la base de datos TaskServiceDB si no existe.
 Autor: TaskService
*/

IF DB_ID('TaskServiceDB') IS NULL
BEGIN
    CREATE DATABASE TaskServiceDB;
END;
GO

USE TaskServiceDB;
GO