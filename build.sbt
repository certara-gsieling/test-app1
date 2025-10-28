name := """new-module2"""
organization := "com.certara"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.13.17"

libraryDependencies += guice

Compile / javacOptions ++= Seq("--release", "21")