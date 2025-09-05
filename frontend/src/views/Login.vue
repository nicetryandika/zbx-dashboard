<template>
  <div style="min-height: 100vh; background-color: #f5f5f5; font-family: Arial, sans-serif; display: flex; flex-direction: column;">

    <!-- Header -->
    <header style="background-color: white; padding: 15px 30px; border-bottom: 2px solid #ddd; display: flex; align-items: center; justify-content: space-between;">
      <div style="font-size: 20px; font-weight: bold; color: #0066cc;">
        PT XYZ
      </div>
      <div style="font-size: 14px; color: #555; font-weight: bold;">
        Login
      </div>
    </header>

    <!-- Login Card -->
    <main style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px;">
      <section
        style="width: 100%; max-width: 400px; background-color: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0px 2px 8px rgba(0,0,0,0.05); text-align: center;"
      >
        <!-- Logo -->
        <div style="margin-bottom: 20px;">
          <img
            src="@/assets/logoiw.png"
            alt="Company Logo"
            style="width: 80px; height: auto; margin: 0 auto;"
          />
        </div>

        <!-- Title -->
        <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 25px; color: #333;">
          Login to Dashboard
        </h2>

        <!-- Username -->
        <div style="margin-bottom: 20px; text-align: left;">
          <label style="display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 8px;">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; outline: none; background-color: #f8faff;"
          />
        </div>

        <!-- Password -->
        <div style="margin-bottom: 25px; text-align: left;">
          <label style="display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 8px;">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; outline: none; background-color: #f8faff;"
          />
        </div>

        <!-- Button -->
        <button
          @click="login"
          style="width: 100%; padding: 12px; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; background-color: #0066cc; color: white; cursor: pointer; transition: background 0.3s;"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </section>
    </main>

    <!-- Footer -->
    <footer style="background-color: white; border-top: 2px solid #ddd; padding: 10px; text-align: center; font-size: 13px; color: #777;">
      © 2025 PT XYZ. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();

const login = async () => {
  if (!username.value || !password.value) {
    alert("Please fill in both fields.");
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post("http://localhost:5000/api/zabbix/login", {
      username: username.value,
      password: password.value,
    });

    const token = res.data.token;
    if (!token) throw new Error("Login failed, token not received.");

    localStorage.setItem("zabbixToken", token);

    // redirect ke dashboard
    router.push("/dashboard");
  } catch (err) {
    alert("Login failed: " + err.message);
  } finally {
    loading.value = false;
  }
};
</script>
